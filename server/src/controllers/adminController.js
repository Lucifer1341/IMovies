import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

export const getAnalytics = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const [
        totalBookings,
        confirmedBookings,
        totalRevenueAgg,
        totalMovies,
        totalUsers,
        totalShows,
        recentBookings,
      ] = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Movie.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'user' }),
        Show.countDocuments({ isActive: true }),
        Booking.find({ status: 'confirmed' })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('bookingRef movieTitle cinemaName totalAmount status createdAt seats')
          .lean(),
      ]);

      return res.json({
        success: true,
        data: {
          totalBookings,
          confirmedBookings,
          totalRevenue: totalRevenueAgg[0]?.total || 0,
          totalMovies,
          totalUsers,
          totalShows,
          recentBookings,
          note: 'Revenue amounts generated strictly from demo payment simulations.',
        },
      });
    }

    // Memory Store analytics
    const totalBookings = memoryStore.bookings.length;
    const confirmedList = memoryStore.bookings.filter((b) => b.status === 'confirmed');
    const confirmedBookings = confirmedList.length;
    const totalRevenue = confirmedList.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalMovies = memoryStore.movies.filter((m) => m.isActive !== false).length;
    const totalUsers = memoryStore.users.filter((u) => u.role === 'user').length;
    const totalShows = memoryStore.shows.filter((s) => s.isActive !== false).length;
    const recentBookings = [...confirmedList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        totalRevenue,
        totalMovies,
        totalUsers,
        totalShows,
        recentBookings,
        note: 'Revenue amounts generated strictly from demo payment simulations.',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const adminGetBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { bookingRef: { $regex: search, $options: 'i' } },
          { movieTitle: { $regex: search, $options: 'i' } },
        ];
      }
      const bookings = await Booking.find(query).sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ success: true, data: bookings });
    }

    let list = [...memoryStore.bookings];
    if (status) list = list.filter((b) => b.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) => b.bookingRef?.toLowerCase().includes(q) || b.movieTitle?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

export const adminGetUsers = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const users = await User.find().sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ success: true, data: users });
    }
    const users = memoryStore.users.map((u) => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, studentVerified } = req.body;

    if (isDbConnected()) {
      const updates = {};
      if (role) updates.role = role;
      if (studentVerified !== undefined) updates.studentVerified = studentVerified;
      const user = await User.findByIdAndUpdate(userId, updates, { new: true });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user.toPublic() });
    }

    const user = memoryStore.users.find((u) => u._id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (role) user.role = role;
    if (studentVerified !== undefined) user.studentVerified = studentVerified;

    const copy = { ...user };
    delete copy.passwordHash;
    res.json({ success: true, data: copy });
  } catch (err) {
    next(err);
  }
};
