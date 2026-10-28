import Movie from '../models/Movie.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

export const getMovies = async (req, res, next) => {
  try {
    const { status, genre, search, page = 1, limit = 20, language } = req.query;

    if (isDbConnected()) {
      const query = { isActive: true };
      if (status) query.status = status;
      if (genre && genre !== 'All') query.genres = { $in: [genre] };
      if (language) query.language = language;
      if (search) query.$text = { $search: search };

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [movies, total] = await Promise.all([
        Movie.find(query).sort({ releaseDate: -1 }).skip(skip).limit(parseInt(limit)).lean(),
        Movie.countDocuments(query),
      ]);
      return res.json({
        success: true,
        data: movies,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      });
    }

    // MemoryStore fallback
    let list = memoryStore.movies.filter((m) => m.isActive !== false);
    if (status) list = list.filter((m) => m.status === status);
    if (genre && genre !== 'All') list = list.filter((m) => m.genres?.includes(genre));
    if (language) list = list.filter((m) => m.language === language);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q) || m.synopsis.toLowerCase().includes(q));
    }

    const total = list.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = list.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (isDbConnected()) {
      const movie = await Movie.findOne({
        $or: [{ _id: movieId.length === 24 ? movieId : null }, { slug: movieId }],
        isActive: true,
      }).lean();
      if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
      return res.json({ success: true, data: movie });
    }

    const movie = memoryStore.movies.find(
      (m) => (m._id === movieId || m.slug === movieId) && m.isActive !== false
    );
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const movie = await Movie.create(req.body);
      return res.status(201).json({ success: true, data: movie });
    }
    const newMovie = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      ...req.body,
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.movies.unshift(newMovie);
    res.status(201).json({ success: true, data: newMovie });
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (isDbConnected()) {
      const movie = await Movie.findByIdAndUpdate(movieId, req.body, { new: true, runValidators: true });
      if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
      return res.json({ success: true, data: movie });
    }
    const idx = memoryStore.movies.findIndex((m) => m._id === movieId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Movie not found' });
    memoryStore.movies[idx] = { ...memoryStore.movies[idx], ...req.body };
    res.json({ success: true, data: memoryStore.movies[idx] });
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (isDbConnected()) {
      const movie = await Movie.findByIdAndUpdate(movieId, { isActive: false }, { new: true });
      if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
      return res.json({ success: true, message: 'Movie deactivated' });
    }
    const movie = memoryStore.movies.find((m) => m._id === movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    movie.isActive = false;
    res.json({ success: true, message: 'Movie deactivated' });
  } catch (err) {
    next(err);
  }
};
