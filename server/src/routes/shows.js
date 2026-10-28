import express from 'express';
import { getShows, getShowById, getShowSeats, createShow, updateShow } from '../controllers/showController.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:showId', getShowById);
router.get('/:showId/seats', optionalAuth, getShowSeats);
router.post('/', authenticate, requireAdmin, createShow);
router.patch('/:showId', authenticate, requireAdmin, updateShow);

export default router;
