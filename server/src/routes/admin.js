import express from 'express';
import { getAnalytics, adminGetBookings, adminGetUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Show from '../models/Show.js';
import Promotion from '../models/Promotion.js';
import { createMovie, updateMovie, deleteMovie } from '../controllers/movieController.js';
import { createCinema, updateCinema } from '../controllers/cinemaController.js';
import { createShow, updateShow } from '../controllers/showController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/bookings', adminGetBookings);
router.get('/users', adminGetUsers);
router.patch('/users/:userId/role', updateUserRole);

// Movie management
router.get('/movies', async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: movies });
  } catch (err) { next(err); }
});
router.post('/movies', createMovie);
router.patch('/movies/:movieId', updateMovie);
router.delete('/movies/:movieId', deleteMovie);

// Cinema management
router.get('/cinemas', async (req, res, next) => {
  try {
    const cinemas = await Cinema.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: cinemas });
  } catch (err) { next(err); }
});
router.post('/cinemas', createCinema);
router.patch('/cinemas/:cinemaId', updateCinema);

// Show management
router.get('/shows', async (req, res, next) => {
  try {
    const shows = await Show.find().populate('movie', 'title').populate('cinema', 'name').sort({ startTime: -1 }).limit(100).lean();
    res.json({ success: true, data: shows });
  } catch (err) { next(err); }
});
router.post('/shows', createShow);
router.patch('/shows/:showId', updateShow);

// Promotion management
router.get('/promotions', async (req, res, next) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: promos });
  } catch (err) { next(err); }
});
router.post('/promotions', async (req, res, next) => {
  try {
    const promo = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promo });
  } catch (err) { next(err); }
});
router.patch('/promotions/:promoId', async (req, res, next) => {
  try {
    const promo = await Promotion.findByIdAndUpdate(req.params.promoId, req.body, { new: true });
    res.json({ success: true, data: promo });
  } catch (err) { next(err); }
});

export default router;
