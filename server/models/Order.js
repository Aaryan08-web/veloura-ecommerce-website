import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    image: String,
    price: Number,
    size: String,
    color: { name: String, hex: String },
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    guestEmail: String,
    items: [orderItemSchema],
    subtotal: Number,
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: Number,
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      street: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      zipCode: String,
      country: String,
    },
    deliveryMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    status: {
      type: String,
      enum: ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
    },
    trackingNumber: String,
    trackingUpdates: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        description: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
