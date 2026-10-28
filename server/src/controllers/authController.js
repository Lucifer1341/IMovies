import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from '../config/index.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      const passwordHash = await User.hashPassword(password);
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone,
      });
      const token = signToken(user._id);
      setCookie(res, token);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: user.toPublic(),
        token,
      });
    } else {
      const existing = memoryStore.users.find((u) => u.email === cleanEmail);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        _id: '66' + Date.now().toString(16).padStart(22, '0'),
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone,
        role: 'user',
        studentVerified: false,
        status: 'active',
        createdAt: new Date(),
      };
      memoryStore.users.push(newUser);
      const token = signToken(newUser._id);
      setCookie(res, token);
      const userPublic = { ...newUser };
      delete userPublic.passwordHash;
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: userPublic,
        token,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is deactivated or suspended' });
      }
      const token = signToken(user._id);
      setCookie(res, token);
      return res.json({
        success: true,
        message: 'Login successful',
        user: user.toPublic(),
        token,
      });
    } else {
      const user = memoryStore.users.find((u) => u.email === cleanEmail);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }
      const token = signToken(user._id);
      setCookie(res, token);
      const userPublic = { ...user };
      delete userPublic.passwordHash;
      return res.json({
        success: true,
        message: 'Login successful',
        user: userPublic,
        token,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  const user = req.user.toPublic ? req.user.toPublic() : req.user;
  res.json({ success: true, user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (isDbConnected()) {
      const updates = {};
      if (name) updates.name = name.trim();
      if (phone !== undefined) updates.phone = phone;
      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
      res.json({ success: true, user: user.toPublic() });
    } else {
      const user = memoryStore.users.find((u) => u._id === req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone;
      const userPublic = { ...user };
      delete userPublic.passwordHash;
      res.json({ success: true, user: userPublic });
    }
  } catch (err) {
    next(err);
  }
};
