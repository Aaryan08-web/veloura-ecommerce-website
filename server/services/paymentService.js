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

export { getRazorpayInstance, getKeyId };