import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { connectDB, getDatabaseStatus } from './server/config/db.js';

import authRoutes from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import cartRoutes from './server/routes/cartRoutes.js';
import wishlistRoutes from './server/routes/wishlistRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import paymentRoutes from './server/routes/paymentRoutes.js';
import contactRoutes from './server/routes/contactRoutes.js';
import chatbotRoutes from './server/routes/chatbotRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust reverse proxy in container/cloud environment
  app.set('trust proxy', 1);

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      trustProxy: false,
      xForwardedForHeader: false,
      forwardedHeader: false,
    },
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    const database = getDatabaseStatus();
    res.json({ status: database.connected ? 'ok' : 'degraded', service: 'veloura-api', database });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/admin', adminRoutes);

  // API 404 handler
  app.all('/api/*', (_req, res) => res.status(404).json({ message: 'API route not found.' }));

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  });

  // The API remains available for demos if MongoDB is unavailable; /api/health reports that fallback.
  await connectDB();

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Veloura App] Serving on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [PORT CONFLICT] Port ${PORT} is currently in use by another process.`);
      console.error(`👉 Solution in Windows PowerShell: Run 'Stop-Process -Name "node" -Force' then 'npm run dev'\n`);
    } else {
      console.error('[Server Listen Error]', err);
    }
  });
}

startServer();
