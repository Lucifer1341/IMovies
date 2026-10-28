import express from 'express';
import { confirmDemoPayment, getPaymentStatus } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/demo/confirm', authenticate, confirmDemoPayment);
router.get('/status/:bookingId', authenticate, getPaymentStatus);

export default router;
