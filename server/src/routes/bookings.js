import express from 'express';
import { createBooking, getMyBookings, getBookingById, cancelBooking } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/me', authenticate, getMyBookings);
router.get('/:bookingId', authenticate, getBookingById);
router.post('/:bookingId/cancel', authenticate, cancelBooking);

export default router;
