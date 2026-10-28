import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import SeatHold from '../models/SeatHold.js';
import TicketVerification from '../models/TicketVerification.js';
import Show from '../models/Show.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const confirmDemoPayment = async (req, res, next) => {
  try {
    const { bookingId, idempotencyKey } = req.body;
    const iKey = idempotencyKey || uuidv4();

    if (isDbConnected()) {
      const existingPayment = await Payment.findOne({ idempotencyRef: iKey });
      if (existingPayment) {
        const booking = await Booking.findById(existingPayment.booking);
        return res.json({ success: true, data: { payment: existingPayment, booking }, message: 'Duplicate transaction — returning verified booking' });
      }

      const booking = await Booking.findOne({
        $or: [{ _id: (bookingId && bookingId.length === 24) ? bookingId : null }, { bookingRef: bookingId }],
        user: req.user._id,
      });

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.status === 'confirmed') {
        return res.json({ success: true, data: { booking }, message: 'Booking already confirmed' });
      }

      const payment = await Payment.create({
        booking: booking._id,
        provider: 'demo',
        transactionRef: 'DEMO-' + uuidv4().slice(0, 8).toUpperCase(),
        amount: booking.totalAmount,
        currency: booking.currency || 'INR',
        status: 'success',
        idempotencyRef: iKey,
        metadata: { note: 'DEMO PAYMENT SIMULATION — No real financial transaction' },
      });

      booking.status = 'confirmed';
      booking.paymentStatus = 'demo_paid';
      await booking.save();

      if (booking.hold) {
        await SeatHold.findByIdAndUpdate(booking.hold, { status: 'converted' });
      }

      const show = await Show.findById(booking.show);
      const ticketVerification = await TicketVerification.createForBooking(
        booking._id,
        show?.startTime || new Date()
      );

      return res.json({
        success: true,
        data: {
          booking,
          payment,
          ticketToken: ticketVerification.token,
          message: 'DEMO PAYMENT CONFIRMED — Simulated ticket issued.',
        },
      });
    }

    // Memory Store execution
    const existingPayment = memoryStore.payments.find((p) => p.idempotencyRef === iKey);
    if (existingPayment) {
      const booking = memoryStore.bookings.find((b) => b._id === existingPayment.booking);
      return res.json({ success: true, data: { payment: existingPayment, booking } });
    }

    const booking = memoryStore.bookings.find(
      (b) => (b._id === bookingId || b.bookingRef === bookingId) && (b.user === req.user._id || b.user?._id === req.user._id)
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'confirmed') {
      return res.json({ success: true, data: { booking }, message: 'Already confirmed' });
    }

    const payment = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      booking: booking._id,
      provider: 'demo',
      transactionRef: 'DEMO-' + uuidv4().slice(0, 8).toUpperCase(),
      amount: booking.totalAmount,
      currency: booking.currency || 'INR',
      status: 'success',
      idempotencyRef: iKey,
      metadata: { note: 'DEMO SIMULATION' },
      createdAt: new Date(),
    };
    memoryStore.payments.push(payment);

    booking.status = 'confirmed';
    booking.paymentStatus = 'demo_paid';

    if (booking.hold) {
      const hold = memoryStore.holds.find((h) => h._id === booking.hold);
      if (hold) hold.status = 'converted';
    }

    // Generate ticket token
    const token = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ticketVerif = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      booking: booking._id,
      token,
      tokenHash,
      status: 'valid',
      expiresAt: new Date(Date.now() + 86400000 * 2),
      createdAt: new Date(),
    };
    memoryStore.ticketVerifications.push(ticketVerif);

    res.json({
      success: true,
      data: {
        booking,
        payment,
        ticketToken: token,
        message: 'DEMO PAYMENT CONFIRMED — Simulated ticket successfully created.',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    if (isDbConnected()) {
      const payment = await Payment.findOne({ booking: bookingId });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
      return res.json({ success: true, data: payment });
    }
    const payment = memoryStore.payments.find((p) => p.booking === bookingId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};
