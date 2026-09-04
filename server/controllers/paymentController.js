import crypto from 'crypto';
import Razorpay from 'razorpay';

const getKeyId = () => process.env.RAZORPAY_KEY_ID?.trim();
const getKeySecret = () => process.env.RAZORPAY_KEY_SECRET?.trim();

const getRazorpayInstance = () => {
  const key_id = getKeyId();
  const key_secret = getKeySecret();
  if (!key_id || !key_secret) {
    return null;
  }
  return new Razorpay({
    key_id,
    key_secret,
  });
};

// POST /api/payment/create-order  (optionalUser)
// Creates a Razorpay order for the given amount (in base currency unit, e.g. rupees or dollars converted to paise)
export const createRazorpayOrder = async (req, res) => {
  try {
    const keyId = getKeyId();
    const instance = getRazorpayInstance();
    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid positive amount is required.' });
    }

    if (!instance) {
      return res.status(503).json({
        message: 'Razorpay credentials not found.',
      });
    }

    // Razorpay amounts are in the smallest currency unit (e.g. Paise for INR, 100 paise = 1 INR)
    const amountInSubunits = Math.round(Number(amount) * 100);

    const order = await instance.orders.create({
        amount: amountInSubunits,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          userId: req.user?.id || 'guest',
          createdVia: 'VELOURA Checkout',
        },
      });

    return res.json({ order, keyId, currency, amount: order.amount });
  } catch (err) {
    console.error('Create order handler error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order.', error: err.message });
  }
};

// POST /api/payment/verify (optionalUser)
// Verifies the signature returned by Razorpay Checkout after a successful payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    const keySecret = getKeySecret();
    if (!keySecret) return res.status(503).json({ message: 'Razorpay is not configured.' });
    const expectedSignature = crypto.createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ verified: false, message: 'Invalid Razorpay payment signature.' });
    }
    return res.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: 'Payment verified successfully.',
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Verification error.', error: err.message });
  }
};

// GET /api/payment/key - expose the public key id to the frontend
export const getRazorpayKey = async (req, res) => {
  const keyId = getKeyId();
  res.json({
    keyId,
    configured: Boolean(keyId),
  });
};

