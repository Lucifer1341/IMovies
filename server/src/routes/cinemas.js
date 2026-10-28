import express from 'express';
import { getCinemas, getCinemaById, createCinema, updateCinema } from '../controllers/cinemaController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCinemas);
router.get('/:cinemaId', getCinemaById);
router.post('/', authenticate, requireAdmin, createCinema);
router.patch('/:cinemaId', authenticate, requireAdmin, updateCinema);

export default router;
