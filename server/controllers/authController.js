import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { generateUserToken, generateAdminToken } from '../utils/generateToken.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';

// ---------- USER AUTH ----------

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    if (!isDbConnected()) {
      const existing = memoryDb.users.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      const user = memoryDb.users.create({ name, email, password, phone });
      const token = generateUserToken(user._id);
      const { password: _, ...safeUser } = user;
      return res.status(201).json({ token, user: safeUser });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = generateUserToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!isDbConnected()) {
      const user = memoryDb.users.findByEmail(email);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      const token = generateUserToken(user._id);
      const { password: _, ...safeUser } = user;
      return res.json({ token, user: safeUser });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = generateUserToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  if (req.user.toSafeObject) {
    return res.json({ user: req.user.toSafeObject() });
  }
  const { password, ...safeUser } = req.user;
  res.json({ user: safeUser });
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'address'];
    if (!isDbConnected()) {
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) req.user[key] = req.body[key];
      });
      const { password, ...safeUser } = req.user;
      return res.json({ user: safeUser });
    }

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    });
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  }
};

export const addAddress = async (req, res) => {
  if (!req.user.savedAddresses) req.user.savedAddresses = [];
  req.user.savedAddresses.push(req.body);
  if (!isDbConnected()) {
    const { password, ...safeUser } = req.user;
    return res.json({ user: safeUser });
  }
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
};

export const removeAddress = async (req, res) => {
  const { index } = req.params;
  if (!req.user.savedAddresses) req.user.savedAddresses = [];
  req.user.savedAddresses.splice(Number(index), 1);
  if (!isDbConnected()) {
    const { password, ...safeUser } = req.user;
    return res.json({ user: safeUser });
  }
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
};

// ---------- ADMIN AUTH ----------

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!isDbConnected()) {
      const admin = memoryDb.admins.findByEmail(cleanEmail);
      if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ message: 'Invalid admin credentials.' });
      }
      const token = generateAdminToken(admin._id);
      return res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
    }

    let admin = await Admin.findOne({ email: cleanEmail }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
    const token = generateAdminToken(admin._id);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: 'Admin login failed.', error: err.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const { name, email, password } = req.body;
      const existing = memoryDb.admins.findByEmail(email);
      if (existing) return res.status(409).json({ message: 'Admin already exists.' });
      const admin = memoryDb.admins.create({ name, email, password });
      const token = generateAdminToken(admin._id);
      return res.status(201).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0 && (!req.admin || req.admin.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Only a superadmin can create new admin accounts.' });
    }
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Admin already exists.' });
    const admin = await Admin.create({
      name,
      email,
      password,
      role: adminCount === 0 ? 'superadmin' : 'admin',
    });
    const token = generateAdminToken(admin._id);
    res.status(201).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: 'Admin registration failed.', error: err.message });
  }
};
