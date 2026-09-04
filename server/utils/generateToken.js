import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const jwtAdminSecret = process.env.ADMIN_JWT_SECRET;

if (!jwtSecret) {
  console.warn('[JWT] WARNING: JWT_SECRET not set in environment. Using process-local development secret.');
  // Generate a deterministic but non-predictable secret for development only
  // In production, this must be set via the JWT_SECRET environment variable
  const crypto = require('crypto');
  jwtSecret = crypto.randomBytes(64).toString('hex');
}
if (!jwtAdminSecret) {
  console.warn('[JWT] WARNING: ADMIN_JWT_SECRET not set in environment. Using process-local development secret.');
  const crypto = require('crypto');
  jwtAdminSecret = crypto.randomBytes(64).toString('hex');
}

export const generateUserToken = (id) =>
  jwt.sign({ id, role: 'user' }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const generateAdminToken = (id) =>
  jwt.sign({ id, role: 'admin' }, jwtAdminSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const getUserSecret = () => jwtSecret;
export const getAdminSecret = () => jwtAdminSecret;
