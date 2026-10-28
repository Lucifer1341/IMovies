import express from 'express';
import { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/movieController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/:movieId', getMovieById);
router.post('/', authenticate, requireAdmin, createMovie);
router.patch('/:movieId', authenticate, requireAdmin, updateMovie);
router.delete('/:movieId', authenticate, requireAdmin, deleteMovie);

export default router;
