import SeatHold from '../models/SeatHold.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';
import { config } from '../config/index.js';

export const createHold = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'No seats selected' });
    }
    if (seats.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 tickets per booking limit exceeded' });
    }

    const now = new Date();
    const requestedLabels = seats.map((s) => s.seatLabel);

    if (isDbConnected()) {
      const show = await Show.findById(showId).populate('cinema').lean();
      if (!show || !show.isActive) {
        return res.status(404).json({ success: false, message: 'Show not found or screening inactive' });
      }

      // Check if seats already booked
      const booked = await Booking.find({ show: showId, status: { $in: ['confirmed', 'pending'] } }).lean();
      const bookedLabels = new Set();
      booked.forEach((b) => b.seats?.forEach((s) => bookedLabels.add(s.seatLabel)));
      const bookedConflicts = requestedLabels.filter((l) => bookedLabels.has(l));
      if (bookedConflicts.length > 0) {
        return res.status(409).json({ success: false, message: `Seats already booked: ${bookedConflicts.join(', ')}` });
      }

      // Check if held by other users
      const activeHolds = await SeatHold.find({
        show: showId,
        status: 'active',
        expiresAt: { $gt: now },
        user: { $ne: req.user._id },
      }).lean();
      const heldLabels = new Set();
      activeHolds.forEach((h) => h.seats?.forEach((s) => heldLabels.add(s.seatLabel)));
      const holdConflicts = requestedLabels.filter((l) => heldLabels.has(l));
      if (holdConflicts.length > 0) {
        return res.status(409).json({ success: false, message: `Seats temporarily reserved by another guest: ${holdConflicts.join(', ')}` });
      }

      // Cancel previous user hold on this show
      await SeatHold.updateMany({ show: showId, user: req.user._id, status: 'active' }, { status: 'cancelled' });

      // Pricing snapshot
      const pricedSeats = seats.map((seat) => {
        const pricing = show.categoryPricing?.find((p) => p.category === seat.category);
        return {
          row: seat.row,
          seatNumber: seat.seatNumber,
          seatLabel: seat.seatLabel,
          category: seat.category || 'standard',
          price: pricing?.price || seat.price || 200,
        };
      });

      const expiresAt = new Date(now.getTime() + (config.holdDurationMinutes || 5) * 60 * 1000);
      const hold = await SeatHold.create({
        show: showId,
        user: req.user._id,
        seats: pricedSeats,
        expiresAt,
        status: 'active',
      });

      return res.status(201).json({ success: true, data: hold });
    }

    // Memory Store concurrency and reservation check
    const show = memoryStore.shows.find((s) => s._id === showId);
    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found or inactive' });
    }

    const booked = memoryStore.bookings.filter(
      (b) => (b.show === showId || b.show?._id === showId) && ['confirmed', 'pending'].includes(b.status)
    );
    const bookedLabels = new Set();
    booked.forEach((b) => b.seats?.forEach((s) => bookedLabels.add(s.seatLabel)));
    const bookedConflicts = requestedLabels.filter((l) => bookedLabels.has(l));
    if (bookedConflicts.length > 0) {
      return res.status(409).json({ success: false, message: `Seats already booked: ${bookedConflicts.join(', ')}` });
    }

    const activeHolds = memoryStore.holds.filter(
      (h) => (h.show === showId || h.show?._id === showId) &&
        h.status === 'active' &&
        new Date(h.expiresAt) > now &&
        h.user !== req.user._id &&
        h.user?._id !== req.user._id
    );
    const heldLabels = new Set();
    activeHolds.forEach((h) => h.seats?.forEach((s) => heldLabels.add(s.seatLabel)));
    const holdConflicts = requestedLabels.filter((l) => heldLabels.has(l));
    if (holdConflicts.length > 0) {
      return res.status(409).json({ success: false, message: `Seats currently held by another buyer: ${holdConflicts.join(', ')}` });
    }

    // Cancel existing holds by this user
    memoryStore.holds.forEach((h) => {
      if ((h.show === showId || h.show?._id === showId) && (h.user === req.user._id || h.user?._id === req.user._id)) {
        h.status = 'cancelled';
      }
    });

    const pricedSeats = seats.map((seat) => {
      const pricing = show.categoryPricing?.find((p) => p.category === seat.category);
      return {
        row: seat.row,
        seatNumber: seat.seatNumber,
        seatLabel: seat.seatLabel,
        category: seat.category || 'standard',
        price: pricing?.price || seat.price || 200,
      };
    });

    const expiresAt = new Date(now.getTime() + (config.holdDurationMinutes || 5) * 60 * 1000);
    const newHold = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      show: showId,
      user: req.user._id,
      seats: pricedSeats,
      expiresAt,
      status: 'active',
      createdAt: now,
    };
    memoryStore.holds.push(newHold);

    res.status(201).json({ success: true, data: newHold });
  } catch (err) {
    next(err);
  }
};

export const getHold = async (req, res, next) => {
  try {
    const { holdId } = req.params;
    const now = new Date();

    if (isDbConnected()) {
      const hold = await SeatHold.findById(holdId).populate('show').lean();
      if (!hold) return res.status(404).json({ success: false, message: 'Hold not found' });
      if (hold.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (hold.status === 'active' && now > hold.expiresAt) {
        await SeatHold.findByIdAndUpdate(hold._id, { status: 'expired' });
        hold.status = 'expired';
      }
      return res.json({ success: true, data: hold });
    }

    const hold = memoryStore.holds.find((h) => h._id === holdId);
    if (!hold) return res.status(404).json({ success: false, message: 'Hold not found' });
    if (hold.user !== req.user._id && hold.user?._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (hold.status === 'active' && now > new Date(hold.expiresAt)) {
      hold.status = 'expired';
    }

    const show = memoryStore.shows.find((s) => s._id === hold.show || s._id === hold.show?._id);
    const movie = memoryStore.movies.find((m) => m._id === show?.movie);
    const cinema = memoryStore.cinemas.find((c) => c._id === show?.cinema);

    res.json({
      success: true,
      data: {
        ...hold,
        show: {
          ...show,
          movie,
          cinema,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const releaseHold = async (req, res, next) => {
  try {
    const { holdId } = req.params;
    if (isDbConnected()) {
      const hold = await SeatHold.findById(holdId);
      if (!hold) return res.status(404).json({ success: false, message: 'Hold not found' });
      if (hold.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      hold.status = 'cancelled';
      await hold.save();
      return res.json({ success: true, message: 'Hold released' });
    }

    const hold = memoryStore.holds.find((h) => h._id === holdId);
    if (!hold) return res.status(404).json({ success: false, message: 'Hold not found' });
    hold.status = 'cancelled';
    res.json({ success: true, message: 'Hold released' });
  } catch (err) {
    next(err);
  }
};
