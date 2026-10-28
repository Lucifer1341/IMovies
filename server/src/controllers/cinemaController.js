import Cinema from '../models/Cinema.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

export const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (isDbConnected()) {
      const query = { isActive: true };
      if (city) query.city = { $regex: city, $options: 'i' };
      const cinemas = await Cinema.find(query).lean();
      return res.json({ success: true, data: cinemas });
    }

    let cinemas = memoryStore.cinemas.filter((c) => c.isActive !== false);
    if (city) {
      cinemas = cinemas.filter((c) => c.city?.toLowerCase().includes(city.toLowerCase()));
    }
    res.json({ success: true, data: cinemas });
  } catch (err) {
    next(err);
  }
};

export const getCinemaById = async (req, res, next) => {
  try {
    const { cinemaId } = req.params;
    if (isDbConnected()) {
      const cinema = await Cinema.findById(cinemaId).lean();
      if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
      return res.json({ success: true, data: cinema });
    }
    const cinema = memoryStore.cinemas.find((c) => c._id === cinemaId);
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
    res.json({ success: true, data: cinema });
  } catch (err) {
    next(err);
  }
};

export const createCinema = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const cinema = await Cinema.create(req.body);
      return res.status(201).json({ success: true, data: cinema });
    }
    const newCinema = {
      _id: '66' + Date.now().toString(16).padStart(22, '0'),
      ...req.body,
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.cinemas.push(newCinema);
    res.status(201).json({ success: true, data: newCinema });
  } catch (err) {
    next(err);
  }
};

export const updateCinema = async (req, res, next) => {
  try {
    const { cinemaId } = req.params;
    if (isDbConnected()) {
      const cinema = await Cinema.findByIdAndUpdate(cinemaId, req.body, { new: true });
      if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
      return res.json({ success: true, data: cinema });
    }
    const idx = memoryStore.cinemas.findIndex((c) => c._id === cinemaId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Cinema not found' });
    memoryStore.cinemas[idx] = { ...memoryStore.cinemas[idx], ...req.body };
    res.json({ success: true, data: memoryStore.cinemas[idx] });
  } catch (err) {
    next(err);
  }
};
