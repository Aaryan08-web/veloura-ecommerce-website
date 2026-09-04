import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

const generateOrderNumber = () => `VEL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

export const createOrder = async (req, res) => {
  try {
    const {
      items, subtotal, shippingFee = 0, discount = 0, total,
      shippingAddress, deliveryMethod = 'standard',
      paymentMethod = 'razorpay', razorpay,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cannot place an order with no items.' });
    }

    const userId = req.user?._id || req.user?.id || null;
    const userEmail = req.user?.email || shippingAddress?.email || '';

    if (!isDbConnected()) {
      const order = memoryDb.orders.create({
        user: userId,
        guestEmail: userEmail,
        items,
        subtotal,
        shippingFee,
        discount,
        total,
        shippingAddress,
        deliveryMethod,
        paymentMethod,
        paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
        razorpay,
      });

      // Clear memory cart if user is authenticated
      if (userId) {
        memoryDb.cart.save(userId, { items: [], couponCode: undefined });
      }

      // Trigger email confirmation asynchronously
      sendOrderConfirmationEmail(order).catch((err) =>
        console.error('[Email Trigger Error]', err)
      );

      return res.status(201).json({ order });
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: userId,
      guestEmail: userEmail,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
      razorpay,
      trackingNumber: `1Z${Math.floor(10000000 + Math.random() * 90000000)}`,
      trackingUpdates: [
        {
          status: 'Order Placed',
          description: 'Order confirmed and verified. Preparing in atelier.',
          timestamp: new Date(),
        },
      ],
    });

    for (const item of items) {
      if (item.product && String(item.product).match(/^[0-9a-fA-F]{24}$/)) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }).catch(() => {});
      }
    }

    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [], couponCode: undefined }).catch(() => {});
    }

    // Trigger email confirmation asynchronously
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error('[Email Trigger Error]', err)
    );

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order.', error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ orders: memoryDb.orders.getByUser(req.user._id) });
  }
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;

  if (!isDbConnected()) {
    const order = memoryDb.orders.getById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.json({ order });
  }

  const query = {
    $or: [{ orderNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  };
  if (userId) {
    query.user = userId;
  }

  const order = await Order.findOne(query);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order });
};

/**
 * Public Order & Tracking Lookup
 * Finds order by orderNumber, _id, trackingNumber, or email lookup
 */
export const trackOrder = async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ message: 'Please provide an order number or tracking ID.' });
    }

    const cleanId = identifier.trim();

    if (!isDbConnected()) {
      const allOrders = memoryDb.orders.getAll();
      const order = allOrders.find(
        (o) =>
          o.orderNumber?.toLowerCase() === cleanId.toLowerCase() ||
          o.id === cleanId ||
          o.trackingNumber?.toLowerCase() === cleanId.toLowerCase()
      );

      if (!order) {
        return res.status(404).json({ message: 'No shipment found matching the provided order or tracking number.' });
      }

      return res.json({
        order,
        trackingUpdates: order.trackingUpdates || [
          { status: order.status || 'Order Placed', timestamp: order.createdAt, description: 'Order confirmed' }
        ],
      });
    }

    const query = {
      $or: [
        { orderNumber: cleanId },
        { trackingNumber: cleanId },
        { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null },
      ].filter(Boolean),
    };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'No shipment found matching the provided order or tracking number.' });
    }

    res.json({
      order,
      trackingUpdates: order.trackingUpdates || [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tracking information.', error: err.message });
  }
};

// ---------- ADMIN ----------

export const getAllOrders = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ orders: memoryDb.orders.getAll() });
  }
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ orders });
};

export const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus, trackingNumber, description } = req.body;
  if (!isDbConnected()) {
    const order = memoryDb.orders.getById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (status) {
      order.status = status;
      if (!order.trackingUpdates) order.trackingUpdates = [];
      order.trackingUpdates.push({
        status,
        description: description || `Order marked as ${status}`,
        timestamp: new Date().toISOString(),
      });
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    return res.json({ order });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (status) {
    order.status = status;
    if (!order.trackingUpdates) order.trackingUpdates = [];
    order.trackingUpdates.push({
      status,
      description: description || `Order marked as ${status}`,
      timestamp: new Date(),
    });
  }
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }
  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber;
  }
  await order.save();
  res.json({ order });
};
