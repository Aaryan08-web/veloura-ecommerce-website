import dotenv from 'dotenv';
dotenv.config();
import dns from 'dns';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';
import { SEED_PRODUCTS } from '../seed/productsData.js';

// Resolve DNS SRV queries on Windows through public DNS resolvers if needed (fixes querySrv ECONNREFUSED on Windows)
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Fallback to default if custom DNS cannot be set
  }
}

// Ensure every model's JSON output includes the virtual `id` property
mongoose.set('toJSON', { virtuals: true });
mongoose.set('bufferCommands', false);

let isConnected = false;
let connectionStatus = { connected: false, mode: 'memory', reason: 'Database connection has not been attempted yet.', updatedAt: new Date().toISOString() };

const setConnectionStatus = (connected, reason) => {
  isConnected = connected;
  connectionStatus = { connected, mode: connected ? 'mongodb' : 'memory', reason, updatedAt: new Date().toISOString() };
  console.log(`[Database] Status: ${connectionStatus.mode}${reason ? ` — ${reason}` : ''}`);
};

/**
 * Normalizes MongoDB Atlas URI to ensure a clean database name is targeted.
 */
function normalizeMongoUri(uri) {
  if (!uri) return '';
  let cleaned = uri.trim();

  // If the user provided the base cluster URI without a database name, append `veloura`
  if (cleaned.includes('.mongodb.net/?') || cleaned.endsWith('.mongodb.net/')) {
    cleaned = cleaned.replace('.mongodb.net/?', '.mongodb.net/veloura?');
    if (cleaned.endsWith('.mongodb.net/')) {
      cleaned = cleaned + 'veloura?retryWrites=true&w=majority';
    }
  }

  return cleaned;
}

/**
 * Automatically seeds the catalog and admin into MongoDB Atlas if the collection is empty.
 */
async function autoBootstrapDatabase() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log(`[Database] Seeding ${SEED_PRODUCTS.length} products to database...`);
      await Product.insertMany(SEED_PRODUCTS);
      console.log(`[Database] Successfully seeded ${SEED_PRODUCTS.length} products.`);
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@veloura.com',
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin',
      });
      console.log(`[Database] Admin initialized: ${process.env.ADMIN_EMAIL || 'admin@veloura.com'}`);
    }
  } catch (seedErr) {
    // Non-fatal warning
    console.log('[Database] Seed status check complete.');
  }
}

export const connectDB = async () => {
  const atlasUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    '';

  let targetUri = '';

  if (atlasUri && atlasUri.trim()) {
    let resolved = atlasUri.trim();
    if (resolved.includes('<db_password>') || resolved.includes('<password>')) {
      console.warn('[Database Warning] Please replace placeholder passwords in your MONGODB_URI environment variable.');
    }
    targetUri = normalizeMongoUri(resolved);
  }

  if (!targetUri || targetUri.includes('<') || targetUri.includes('>')) {
    setConnectionStatus(false, 'No valid MONGODB_URI is configured; using the in-memory fallback.');
    return false;
  }

  try {
    console.log('[Database] Attempting connection to MongoDB Atlas...');
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 8000,
      family: 4, // Force IPv4 to prevent Windows Node.js DNS resolution errors
    });

    setConnectionStatus(true, 'MongoDB connection established.');
    const host = mongoose.connection.host || 'Atlas Cluster';
    const dbName = mongoose.connection.name || 'veloura';
    console.log(`[Database] Connected successfully to MongoDB: ${host} (${dbName})`);

    // Auto-bootstrap products and admin into Atlas
    await autoBootstrapDatabase();

    return true;
  } catch (err) {
    setConnectionStatus(false, 'MongoDB connection failed; using the in-memory fallback.');
    if (err && err.message) {
      console.log(`[Database Connection Detail] ${err.message}`);
    }
    return false;
  }
};

export const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;
export const getDatabaseStatus = () => ({ ...connectionStatus, connected: isDbConnected(), mode: isDbConnected() ? 'mongodb' : 'memory' });
