import express from 'express';
import { getTicket, verifyTicket } from '../controllers/ticketController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:bookingId', authenticate, getTicket);
router.post('/verify', verifyTicket); // Public verification endpoint

export default router;
