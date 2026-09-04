import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Contact from '../models/Contact.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';
import { verifyEmailConfig, sendTestEmail } from '../services/emailService.js';

export const getDashboardStats = async (req, res) => {
  if (!isDbConnected()) {
    const products = memoryDb.products.find();
    const orders = memoryDb.orders.getAll();
    const users = memoryDb.users.getAll();
    const contacts = memoryDb.contacts.getAll();

    const revenue = orders
      .filter((o) => o.paymentStatus === 'paid' || o.status === 'processing')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const lowStock = products
      .filter((p) => p.stock <= 15 && p.isActive)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock, brand: p.brand, category: p.category, price: p.price }))
      .slice(0, 10);

    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length;
    const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending').length;

    return res.json({
      stats: {
        userCount: users.length,
        productCount: products.length,
        orderCount: orders.length,
        revenue,
        paidOrders,
        pendingOrders,
        unreadContacts: contacts.filter((c) => c.status === 'new').length,
      },
      lowStock,
      recentOrders: orders.slice(0, 6),
      database: {
        connected: false,
        type: 'In-Memory Store (Resilient Fallback)',
        host: 'Local Memory',
        database: 'veloura',
      },
    });
  }

  const [userCount, productCount, orderCount, allOrders, unreadContacts] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }),
    Contact.countDocuments({ status: 'new' }),
  ]);

  const revenue = allOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const paidOrders = allOrders.filter((o) => o.paymentStatus === 'paid').length;
  const pendingOrders = allOrders.filter((o) => o.paymentStatus === 'pending').length;

  const lowStock = await Product.find({ stock: { $lte: 10 }, isActive: true })
    .select('name stock brand category price')
    .limit(10);

  res.json({
    stats: {
      userCount,
      productCount,
      orderCount,
      revenue,
      paidOrders,
      pendingOrders,
      unreadContacts,
    },
    lowStock,
    recentOrders: allOrders.slice(0, 6),
    database: {
      connected: true,
      type: 'MongoDB Atlas',
      host: mongoose.connection.host || 'Atlas Cluster',
      database: mongoose.connection.name || 'veloura',
    },
  });
};

/**
 * GET /api/admin/analytics/sales?period=daily|weekly|monthly
 * Aggregates revenue, order counts, and units sold over time
 */
export const getSalesAnalytics = async (req, res) => {
  try {
    const period = (req.query.period || 'daily').toLowerCase();
    const now = new Date();

    let allOrders = [];
    if (!isDbConnected()) {
      allOrders = memoryDb.orders.getAll();
    } else {
      allOrders = await Order.find().sort({ createdAt: 1 }).lean();
    }

    // Helper to format date labels
    const formatDailyLabel = (d) => {
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };
    const formatMonthlyLabel = (d) => {
      return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    };

    let timeBuckets = [];

    if (period === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        timeBuckets.push({
          key,
          label: formatMonthlyLabel(d),
          start: new Date(year, month, 1),
          end: new Date(year, month + 1, 0, 23, 59, 59, 999),
          revenue: 0,
          ordersCount: 0,
          unitsSold: 0,
        });
      }
    } else if (period === 'weekly') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        const label = `${start.getDate()} ${start.toLocaleDateString('en-IN', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('en-IN', { month: 'short' })}`;
        timeBuckets.push({
          key: `w_${i}`,
          label,
          start,
          end,
          revenue: 0,
          ordersCount: 0,
          unitsSold: 0,
        });
      }
    } else {
      // Daily: Last 14 days
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        d.setHours(0, 0, 0, 0);
        const endOfDay = new Date(d);
        endOfDay.setHours(23, 59, 59, 999);
        const key = d.toISOString().split('T')[0];
        timeBuckets.push({
          key,
          label: formatDailyLabel(d),
          start: d,
          end: endOfDay,
          revenue: 0,
          ordersCount: 0,
          unitsSold: 0,
        });
      }
    }

    // Distribute orders into buckets
    let totalRevenue = 0;
    let totalPaidOrders = 0;
    let totalUnits = 0;

    allOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt || Date.now());
      const isPaid = order.paymentStatus === 'paid' || order.status === 'Processing' || order.status === 'Delivered';
      const orderTotal = Number(order.total || 0);
      const itemsCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

      if (isPaid) {
        totalRevenue += orderTotal;
        totalPaidOrders += 1;
        totalUnits += itemsCount;
      }

      // Match bucket
      const bucket = timeBuckets.find(
        (b) => orderDate >= b.start && orderDate <= b.end
      );

      if (bucket) {
        if (isPaid) {
          bucket.revenue += orderTotal;
          bucket.ordersCount += 1;
          bucket.unitsSold += itemsCount;
        }
      }
    });

    const seriesData = timeBuckets.map((b) => ({
      date: b.key,
      label: b.label,
      revenue: Math.round(b.revenue),
      orders: b.ordersCount,
      units: b.unitsSold,
      avgOrderValue: b.ordersCount > 0 ? Math.round(b.revenue / b.ordersCount) : 0,
    }));

    // Category breakdown
    const categoryTotals = {};
    allOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const cat = item.category || 'Atelier Collection';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.price * item.quantity || 0);
      });
    });

    const categoryDistribution = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    res.json({
      period,
      series: seriesData,
      summary: {
        totalRevenue,
        totalOrders: totalPaidOrders,
        totalUnits,
        averageOrderValue: totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0,
      },
      categoryDistribution,
    });
  } catch (err) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ message: 'Failed to aggregate sales analytics.', error: err.message });
  }
};

export const listUsers = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ users: memoryDb.users.getAll() });
  }
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
};

export const toggleUserActive = async (req, res) => {
  if (!isDbConnected()) {
    const user = memoryDb.users.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    const { password, ...safe } = user;
    return res.json({ user: safe });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ user: user.toSafeObject() });
};

export const getEmailStatus = async (req, res) => {
  try {
    const verification = await verifyEmailConfig();
    res.json({
      ...verification,
      provider: process.env.SMTP_HOST ? 'Custom SMTP' : process.env.GMAIL_USER ? 'Gmail Service' : 'Console Preview Mode',
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || '"VELOURA Atelier" <orders@veloura.store>',
      host: process.env.SMTP_HOST || 'None (Using Preview Log)',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER || process.env.GMAIL_USER || 'Unset',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify email configuration', error: err.message });
  }
};

export const sendAdminTestEmail = async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const emailToSend = targetEmail || req.user?.email || 'customer@example.com';
    const result = await sendTestEmail(emailToSend);
    res.json({
      message: `Test email dispatched to ${emailToSend}`,
      result,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to dispatch test email', error: err.message });
  }
};

export const getDatabaseStatus = async (req, res) => {
  const connected = isDbConnected();
  res.json({
    connected,
    readyState: mongoose.connection.readyState,
    host: connected ? mongoose.connection.host : 'None',
    database: connected ? mongoose.connection.name : 'In-Memory Store',
    mode: connected ? 'MongoDB Atlas' : 'Resilient In-Memory Fallback',
    message: connected ? 'Database connection is healthy and active.' : 'Database is not connected. Running on in-memory fallback store.',
  });
};


