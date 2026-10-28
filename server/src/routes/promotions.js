import express from 'express';
import { validatePromotion } from '../controllers/promotionController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', optionalAuth, validatePromotion);

export default router;
