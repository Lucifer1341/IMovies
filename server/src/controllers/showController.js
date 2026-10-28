import Show from '../models/Show.js';
import Cinema from '../models/Cinema.js';
import Booking from '../models/Booking.js';
import SeatHold from '../models/SeatHold.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

export const getShows = async (req, res, next) => {
  try {
    const { movieId, cinemaId, date, format } = req.query;

    if (isDbConnected()) {
      const query = { isActive: true };
      if (movieId) query.movie = movieId;
      if (cinemaId) query.cinema = cinemaId;
      if (format) query.format = format;

      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.startTime = { $gte: start, $lte: end };
      } else {
        query.startTime = { $gte: new Date(Date.now() - 3600000) };
      }

      const shows = await Show.find(query)
        .populate('movie', 'title slug posterUrl runtime language')
        .populate('cinema', 'name location city')
        .sort({ startTime: 1 })
        .lean();

      return res.json({ success: true, data: shows });
    }

    // Memory Store shows
    let shows = memoryStore.shows.filter((s) => s.isActive !== false);
    if (movieId) shows = shows.filter((s) => s.movie === movieId || s.movie?._id === movieId);
    if (cinemaId) shows = shows.filter((s) => s.cinema === cinemaId || s.cinema?._id === cinemaId);
    if (format) shows = shows.filter((s) => s.format === format);
    if (date) {
      const targetDate = new Date(date).toDateString();
      shows = shows.filter((s) => new Date(s.startTime).toDateString() === targetDate);
    }

    const populatedShows = shows.map((s) => {
      const movie = memoryStore.movies.find((m) => m._id === s.movie || m._id === s.movie?._id);
      const cinema = memoryStore.cinemas.find((c) => c._id === s.cinema || c._id === s.cinema?._id);
      return {
        ...s,
        movie: movie ? { _id: movie._id, title: movie.title, slug: movie.slug, posterUrl: movie.posterUrl, runtime: movie.runtime, language: movie.language } : s.movie,
        cinema: cinema ? { _id: cinema._id, name: cinema.name, location: cinema.location, city: cinema.city } : s.cinema,
      };
    });

    res.json({ success: true, data: populatedShows });
  } catch (err) {
    next(err);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const { showId } = req.params;

    if (isDbConnected()) {
      const show = await Show.findById(showId).populate('movie').populate('cinema').lean();
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
      return res.json({ success: true, data: show });
    }

    const show = memoryStore.shows.find((s) => s._id === showId);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    const movie = memoryStore.movies.find((m) => m._id === show.movie || m._id === show.movie?._id);
    const cinema = memoryStore.cinemas.find((c) => c._id === show.cinema || c._id === show.cinema?._id);

    res.json({
      success: true,
      data: {
        ...show,
        movie,
        cinema,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getShowSeats = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const now = new Date();

    let show, cinema, auditorium;
    let bookedSeatLabels = new Set();
    let heldSeatLabels = new Set();
    let userHeldSeats = new Set();

    if (isDbConnected()) {
      show = await Show.findById(showId).populate('cinema').lean();
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
      cinema = show.cinema;
      auditorium = cinema.auditoriums?.find((a) => a.name === show.auditoriumName);

      const booked = await Booking.find({ show: showId, status: { $in: ['confirmed', 'pending'] } }).lean();
      booked.forEach((b) => b.seats?.forEach((s) => bookedSeatLabels.add(s.seatLabel)));

      const activeHolds = await SeatHold.find({ show: showId, status: 'active', expiresAt: { $gt: now } }).lean();
      activeHolds.forEach((h) => {
        h.seats?.forEach((s) => {
          heldSeatLabels.add(s.seatLabel);
          if (req.user && (h.user?.toString() === req.user._id?.toString() || h.user === req.user._id)) {
            userHeldSeats.add(s.seatLabel);
          }
        });
      });
    } else {
      show = memoryStore.shows.find((s) => s._id === showId);
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
      cinema = memoryStore.cinemas.find((c) => c._id === show.cinema || c._id === show.cinema?._id);
      auditorium = cinema?.auditoriums?.find((a) => a.name === show.auditoriumName);

      // Memory bookings
      const booked = memoryStore.bookings.filter(
        (b) => (b.show === showId || b.show?._id === showId) && ['confirmed', 'pending'].includes(b.status)
      );
      booked.forEach((b) => b.seats?.forEach((s) => bookedSeatLabels.add(s.seatLabel)));

      // Memory holds
      const activeHolds = memoryStore.holds.filter(
        (h) => (h.show === showId || h.show?._id === showId) && h.status === 'active' && new Date(h.expiresAt) > now
      );
      activeHolds.forEach((h) => {
        h.seats?.forEach((s) => {
          heldSeatLabels.add(s.seatLabel);
          if (req.user && (h.user === req.user._id || h.user?._id === req.user._id)) {
            userHeldSeats.add(s.seatLabel);
          }
        });
      });
    }

    if (!auditorium) {
      return res.status(404).json({ success: false, message: 'Auditorium configuration not found' });
    }

    // Build seats map with real availability
    const seatMap = auditorium.rows.map((row) => ({
      row: row.row,
      category: row.category,
      seats: row.seatNumbers.map((num) => {
        const label = `${row.row}${num}`;
        let state = 'available';
        if (bookedSeatLabels.has(label)) state = 'booked';
        else if (userHeldSeats.has(label)) state = 'held_by_you';
        else if (heldSeatLabels.has(label)) state = 'held';

        const pricing = show.categoryPricing?.find((p) => p.category === row.category);
        return {
          label,
          row: row.row,
          number: num,
          category: row.category,
          state,
          price: pricing?.price || 200,
          studentDiscount: pricing?.studentDiscount || 0,
        };
      }),
    }));

    res.json({
      success: true,
      data: {
        showId,
        auditoriumName: show.auditoriumName,
        format: show.format,
        seatMap,
        categoryPricing: show.categoryPricing,
        currency: show.currency || 'INR',
        totalSeats: show.totalSeats,
        availableSeats: show.totalSeats - bookedSeatLabels.size - (heldSeatLabels.size - userHeldSeats.size),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createShow = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const show = await Show.create(req.body);
      const populated = await Show.findById(show._id).populate('movie', 'title').populate('cinema', 'name');
      return res.status(201).json({ success: true, data: populated });
    }
    const newShow = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      ...req.body,
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.shows.push(newShow);
    res.status(201).json({ success: true, data: newShow });
  } catch (err) {
    next(err);
  }
};

export const updateShow = async (req, res, next) => {
  try {
    const { showId } = req.params;
    if (isDbConnected()) {
      const show = await Show.findByIdAndUpdate(showId, req.body, { new: true });
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
      return res.json({ success: true, data: show });
    }
    const idx = memoryStore.shows.findIndex((s) => s._id === showId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Show not found' });
    memoryStore.shows[idx] = { ...memoryStore.shows[idx], ...req.body };
    res.json({ success: true, data: memoryStore.shows[idx] });
  } catch (err) {
    next(err);
  }
};
