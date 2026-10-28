import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/index.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    if (isDbConnected()) {
      const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
      if (!user || user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'User not found or suspended' });
      }
      req.user = user;
    } else {
      // Memory Store lookup
      const user = memoryStore.users.find((u) => u._id === decoded.id || u._id?.toString() === decoded.id);
      if (!user || user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'User not found or suspended' });
      }
      const userObj = { ...user };
      delete userObj.passwordHash;
      userObj.toPublic = () => userObj;
      req.user = userObj;
    }

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
    }
    next(err);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.token) token = req.cookies.token;
    else if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.slice(7);

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (isDbConnected()) {
        req.user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
      } else {
        const user = memoryStore.users.find((u) => u._id === decoded.id || u._id?.toString() === decoded.id);
        if (user && user.status === 'active') {
          const userObj = { ...user };
          delete userObj.passwordHash;
          userObj.toPublic = () => userObj;
          req.user = userObj;
        }
      }
    }
    next();
  } catch {
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};
