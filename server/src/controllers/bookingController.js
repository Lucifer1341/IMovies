import Booking from '../models/Booking.js';
import SeatHold from '../models/SeatHold.js';
import Show from '../models/Show.js';
import Promotion from '../models/Promotion.js';
import TicketVerification from '../models/TicketVerification.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function calculateTotal(hold, promotionCode, user, show) {
  let subtotal = hold.seats.reduce((sum, s) => sum + s.price, 0);
  let discount = 0;
  let promotionDiscount = 0;
  let promoDetails = null;

  if (promotionCode) {
    let promo = null;
    if (isDbConnected()) {
      promo = await Promotion.findOne({
        code: promotionCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });
    } else {
      promo = memoryStore.promotions.find(
        (p) => p.code === promotionCode.toUpperCase() && p.isActive !== false
      );
    }

    if (promo) {
      const isStudentOnly = promo.eligibility?.studentOnly;
      const minTickets = promo.eligibility?.minTickets || 1;

      if (isStudentOnly && !user.studentVerified) {
        // Not eligible
      } else if (hold.seats.length < minTickets) {
        // Not enough tickets
      } else {
        if (promo.discountType === 'percentage') {
          promotionDiscount = Math.round((subtotal * promo.discountValue) / 100);
          if (promo.maxDiscountAmount) {
            promotionDiscount = Math.min(promotionDiscount, promo.maxDiscountAmount);
          }
        } else {
          promotionDiscount = Math.min(promo.discountValue, subtotal);
        }
        promoDetails = promo;
      }
    }
  }

  const totalAmount = Math.max(0, subtotal - discount - promotionDiscount);
  return { subtotal, discount, promotionDiscount, totalAmount, promoDetails };
}

export const createBooking = async (req, res, next) => {
  try {
    const { holdId, promotionCode, idempotencyKey } = req.body;
    const now = new Date();

    if (isDbConnected()) {
      if (idempotencyKey) {
        const existing = await Booking.findOne({ idempotencyKey });
        if (existing) {
          return res.json({ success: true, data: existing, message: 'Existing booking returned' });
        }
      }

      const hold = await SeatHold.findById(holdId);
      if (!hold) return res.status(404).json({ success: false, message: 'Hold session not found' });
      if (hold.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (hold.status !== 'active') {
        return res.status(400).json({ success: false, message: `Reservation hold is ${hold.status}` });
      }
      if (now > hold.expiresAt) {
        hold.status = 'expired';
        await hold.save();
        return res.status(400).json({ success: false, message: 'Reservation hold has expired. Please select seats again.' });
      }

      const show = await Show.findById(hold.show).populate('movie').populate('cinema').lean();
      const { subtotal, discount, promotionDiscount, totalAmount, promoDetails } = await calculateTotal(hold, promotionCode, req.user, show);

      const booking = await Booking.create({
        user: req.user._id,
        show: hold.show,
        hold: hold._id,
        seats: hold.seats,
        subtotal,
        discount,
        promotionCode: promoDetails?.code,
        promotionDiscount,
        totalAmount,
        currency: show.currency || 'INR',
        movieTitle: show.movie?.title,
        moviePosterUrl: show.movie?.posterUrl,
        cinemaName: show.cinema?.name,
        auditoriumName: show.auditoriumName,
        showStartTime: show.startTime,
        showFormat: show.format,
        status: 'pending',
        paymentStatus: 'unpaid',
        idempotencyKey: idempotencyKey || uuidv4(),
      });

      return res.status(201).json({ success: true, data: booking });
    }

    // Memory Store path
    if (idempotencyKey) {
      const existing = memoryStore.bookings.find((b) => b.idempotencyKey === idempotencyKey);
      if (existing) {
        return res.json({ success: true, data: existing, message: 'Existing booking returned' });
      }
    }

    const hold = memoryStore.holds.find((h) => h._id === holdId);
    if (!hold) return res.status(404).json({ success: false, message: 'Hold session not found' });
    if (hold.status !== 'active') {
      return res.status(400).json({ success: false, message: `Hold is ${hold.status}` });
    }
    if (now > new Date(hold.expiresAt)) {
      hold.status = 'expired';
      return res.status(400).json({ success: false, message: 'Hold expired. Please select seats again.' });
    }

    const show = memoryStore.shows.find((s) => s._id === hold.show || s._id === hold.show?._id);
    const movie = memoryStore.movies.find((m) => m._id === show?.movie);
    const cinema = memoryStore.cinemas.find((c) => c._id === show?.cinema);

    const { subtotal, discount, promotionDiscount, totalAmount, promoDetails } = await calculateTotal(hold, promotionCode, req.user, show);

    const booking = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      user: req.user._id,
      show: hold.show,
      hold: hold._id,
      bookingRef: 'BK' + uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase(),
      seats: hold.seats,
      subtotal,
      discount,
      promotionCode: promoDetails?.code,
      promotionDiscount,
      totalAmount,
      currency: show?.currency || 'INR',
      movieTitle: movie?.title || 'IMovies Feature',
      moviePosterUrl: movie?.posterUrl || '',
      cinemaName: cinema?.name || 'IMovies Multiplex',
      auditoriumName: show?.auditoriumName || 'Screen 1',
      showStartTime: show?.startTime || new Date(),
      showFormat: show?.format || 'Standard',
      status: 'pending',
      paymentStatus: 'unpaid',
      idempotencyKey: idempotencyKey || uuidv4(),
      createdAt: now,
    };

    memoryStore.bookings.push(booking);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    if (isDbConnected()) {
      const query = { user: req.user._id };
      if (status) query.status = status;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [bookings, total] = await Promise.all([
        Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
        Booking.countDocuments(query),
      ]);
      return res.json({ success: true, data: bookings, pagination: { total } });
    }

    let bookings = memoryStore.bookings.filter(
      (b) => b.user === req.user._id || b.user?._id === req.user._id
    );
    if (status) bookings = bookings.filter((b) => b.status === status);
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: bookings, pagination: { total: bookings.length } });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (isDbConnected()) {
      const booking = await Booking.findOne({
        $or: [{ _id: bookingId.length === 24 ? bookingId : null }, { bookingRef: bookingId }],
      }).lean();
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      return res.json({ success: true, data: booking });
    }

    const booking = memoryStore.bookings.find(
      (b) => b._id === bookingId || b.bookingRef === bookingId
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user !== req.user._id && booking.user?._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (isDbConnected()) {
      const booking = await Booking.findOne({
        $or: [{ _id: bookingId.length === 24 ? bookingId : null }, { bookingRef: bookingId }],
      });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (booking.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancellationReason = reason || 'Customer requested';
      if (booking.paymentStatus === 'demo_paid') {
        booking.refundStatus = 'processed';
        booking.paymentStatus = 'refunded';
      }
      await booking.save();
      await TicketVerification.findOneAndUpdate({ booking: booking._id }, { status: 'revoked' });

      return res.json({ success: true, data: booking, message: 'Booking cancelled successfully (Demo refund credited)' });
    }

    const booking = memoryStore.bookings.find(
      (b) => b._id === bookingId || b.bookingRef === bookingId
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Customer requested';
    if (booking.paymentStatus === 'demo_paid') {
      booking.refundStatus = 'processed';
      booking.paymentStatus = 'refunded';
    }

    // Revoke memory ticket
    const ticket = memoryStore.ticketVerifications.find((t) => t.booking === booking._id);
    if (ticket) ticket.status = 'revoked';

    res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
};
