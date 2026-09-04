import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';
import { getUserSecret, getAdminSecret } from '../utils/generateToken.js';

// Protect routes for logged-in users
export const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. Please log in to continue.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getUserSecret());

    if (!isDbConnected()) {
      const user = memoryDb.users.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Not authorized. Please log in again.' });
      }
      req.user = user;
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Not authorized. Please log in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }
};

// Protect routes for admins only
export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin authorization required.' });
    }
    const token = authHeader.split(' ')[1];

    let adminId = null;
    try {
      const decoded = jwt.verify(token, getAdminSecret());
      adminId = decoded.id;
    } catch (jwtErr) {
      throw jwtErr;
    }

    if (!isDbConnected()) {
      return res.status(401).json({ message: 'Admin authentication required. Please log in.' });
    }

    let admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Admin session expired or invalid.' });
  }
};

// Optional auth - attaches req.user if a valid token is present, but never blocks the request
export const optionalUser = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, getUserSecret());
      if (!isDbConnected()) {
        const user = memoryDb.users.findById(decoded.id);
        if (user) req.user = user;
      } else {
        const user = await User.findById(decoded.id);
        if (user) req.user = user;
      }
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};
