import Booking from '../models/Booking.js';
import TicketVerification from '../models/TicketVerification.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';
import QRCode from 'qrcode';

export const getTicket = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (isDbConnected()) {
      const booking = await Booking.findOne({
        $or: [{ _id: bookingId.length === 24 ? bookingId : null }, { bookingRef: bookingId }],
      }).lean();

      if (!booking) return res.status(404).json({ success: false, message: 'Ticket booking not found' });
      if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (booking.status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'Ticket is only issued for confirmed bookings' });
      }

      const ticketVerif = await TicketVerification.findOne({ booking: booking._id }).lean();
      const token = ticketVerif?.token || 'DEMO-VERIF-' + booking.bookingRef;

      const qrPayload = `IMOVIES:VERIFY:${token}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: { dark: '#0a0e18', light: '#ffffff' },
        width: 260,
      });

      return res.json({
        success: true,
        data: {
          booking,
          ticketToken: token,
          qrCode: qrCodeDataUrl,
          verificationStatus: ticketVerif?.status || 'valid',
          expiresAt: ticketVerif?.expiresAt,
          note: 'DEMO TICKET — For demonstration purposes only. Not valid at commercial cinemas.',
        },
      });
    }

    // Memory Store ticket retrieval
    const booking = memoryStore.bookings.find(
      (b) => b._id === bookingId || b.bookingRef === bookingId
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Ticket booking not found' });
    if (req.user.role !== 'admin' && booking.user !== req.user._id && booking.user?._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Ticket available only for confirmed bookings' });
    }

    const ticketVerif = memoryStore.ticketVerifications.find((t) => t.booking === booking._id);
    const token = ticketVerif?.token || 'DEMO-TOKEN-' + booking.bookingRef;

    const qrPayload = `IMOVIES:VERIFY:${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#0a0e18', light: '#ffffff' },
      width: 260,
    });

    res.json({
      success: true,
      data: {
        booking,
        ticketToken: token,
        qrCode: qrCodeDataUrl,
        verificationStatus: ticketVerif?.status || 'valid',
        expiresAt: ticketVerif?.expiresAt,
        note: 'DEMO TICKET — Issued for academic simulation purposes.',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyTicket = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Verification token required' });

    if (isDbConnected()) {
      const ticketVerif = await TicketVerification.findOne({ token }).populate('booking').lean();
      if (!ticketVerif) {
        return res.status(404).json({ success: false, valid: false, message: 'Unrecognized verification token' });
      }

      if (ticketVerif.status === 'revoked') {
        return res.json({ success: false, valid: false, message: 'Ticket was revoked (Booking Cancelled)' });
      }
      if (ticketVerif.status === 'used') {
        return res.json({ success: false, valid: false, message: 'Ticket has already been admitted at cinema gate' });
      }

      const booking = ticketVerif.booking;
      return res.json({
        success: true,
        valid: true,
        data: {
          bookingRef: booking?.bookingRef,
          movieTitle: booking?.movieTitle,
          cinemaName: booking?.cinemaName,
          showTime: booking?.showStartTime,
          seatCount: booking?.seats?.length,
          seats: booking?.seats?.map((s) => s.seatLabel).join(', '),
          status: 'Valid Admission',
          note: 'VERIFIED — Demo pass approved for entry.',
        },
      });
    }

    // Memory Store verification
    const ticketVerif = memoryStore.ticketVerifications.find((t) => t.token === token);
    if (!ticketVerif) {
      return res.status(404).json({ success: false, valid: false, message: 'Ticket verification token not found' });
    }

    const booking = memoryStore.bookings.find((b) => b._id === ticketVerif.booking);
    if (ticketVerif.status === 'revoked') {
      return res.json({ success: false, valid: false, message: 'Ticket was revoked (Booking Cancelled)' });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        bookingRef: booking?.bookingRef,
        movieTitle: booking?.movieTitle,
        cinemaName: booking?.cinemaName,
        showTime: booking?.showStartTime,
        seatCount: booking?.seats?.length,
        seats: booking?.seats?.map((s) => s.seatLabel).join(', '),
        status: 'Valid Admission',
        note: 'VERIFIED — Demo pass approved for entry.',
      },
    });
  } catch (err) {
    next(err);
  }
};
