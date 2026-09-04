import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';
import { SEED_PRODUCTS } from './productsData.js';

const runSeed = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.log('[Seed] Could not connect to MongoDB Atlas. Ensure MONGODB_URI has valid credentials.');
    process.exit(1);
  }

  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`[Seed] ${existing} products already exist in MongoDB Atlas.`);
  } else {
    await Product.insertMany(SEED_PRODUCTS);
    console.log(`[Seed] Inserted ${SEED_PRODUCTS.length} products into MongoDB Atlas.`);
  }

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@veloura.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'superadmin',
    });
    console.log(`[Seed] Created bootstrap admin: ${process.env.ADMIN_EMAIL || 'admin@veloura.com'}`);
  } else {
    console.log('[Seed] Admin already exists in MongoDB Atlas.');
  }

  await mongoose.disconnect();
  console.log('[Seed] Done.');
};

runSeed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
