import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';

/**
 * Creates and configures nodemailer transporter with support for:
 * 1. Custom SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)
 * 2. Gmail service (GMAIL_USER, GMAIL_APP_PASSWORD / GMAIL_PASS)
 * 3. Safe fallback mode with structured console preview when SMTP credentials are not configured
 */
let transporter = null;
let isTransporterVerified = false;

export const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`[Nodemailer] Configured Custom SMTP transporter (${host}:${port}, secure=${secure})`);
  } else if (process.env.GMAIL_USER && (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS)) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`[Nodemailer] Configured Gmail transporter for ${process.env.GMAIL_USER}`);
  }

  return transporter;
};

/**
 * Verifies the Nodemailer SMTP connection
 */
export const verifyEmailConfig = async () => {
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    return {
      configured: false,
      status: 'unconfigured',
      message: 'SMTP credentials not configured. Emails will be logged in console preview mode.',
    };
  }

  try {
    await activeTransporter.verify();
    isTransporterVerified = true;
    return {
      configured: true,
      status: 'connected',
      message: 'SMTP Server connection verified successfully.',
    };
  } catch (error) {
    console.warn('[Nodemailer Verify Warning]', error.message);
    return {
      configured: true,
      status: 'error',
      message: error.message,
    };
  }
};

/**
 * Generates luxury responsive HTML email for order confirmation
 */
export const generateOrderConfirmationHtml = (order) => {
  const items = order.items || [];
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e7e5e4;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${
                item.image
                  ? `<td width="68" valign="top" style="padding-right: 16px;">
                      <img src="${item.image}" alt="${item.productName || 'Product'}" width="68" height="88" style="display:block; object-fit:cover; border-radius: 4px; border: 1px solid #e7e5e4;" />
                     </td>`
                  : ''
              }
              <td valign="top">
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1c1917; margin-bottom: 4px;">
                  ${item.productName || 'Luxury Atelier Piece'}
                </div>
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #78716c; margin-bottom: 6px;">
                  ${item.size ? `Size: <strong>${item.size}</strong> &nbsp;•&nbsp; ` : ''}
                  ${item.color?.name ? `Color: <strong>${item.color.name}</strong> &nbsp;•&nbsp; ` : ''}
                  Qty: <strong>${item.quantity}</strong>
                </div>
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1c1917;">
                  ₹${Number(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join('');

  const shippingAddr = order.shippingAddress || {};
  const formattedAddress = [
    shippingAddr.fullName,
    shippingAddr.addressLine1 || shippingAddr.street,
    shippingAddr.addressLine2,
    `${shippingAddr.city || ''} ${shippingAddr.state || ''} ${shippingAddr.postalCode || shippingAddr.zipCode || ''}`.trim(),
    shippingAddr.country,
  ]
    .filter(Boolean)
    .join(', ');

  const orderNum = order.orderNumber || order.id || order._id || `VEL-${Date.now().toString().slice(-6)}`;
  const appBaseUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000';
  const trackingLink = `${appBaseUrl}/track-order/${orderNum}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment & Order Confirmation - VELOURA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafaf9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0c0a09; padding: 36px 32px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 0.28em; color: #ffffff; font-weight: 300; text-transform: uppercase;">
                VELOURA
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 10px; letter-spacing: 0.3em; color: #a8a29e; text-transform: uppercase;">
                Wear Your Aura • Luxury Atelier
              </p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f5f5f4;">
              <div style="display: inline-block; padding: 6px 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #166534; text-transform: uppercase; margin-bottom: 16px;">
                ✓ Payment Verified & Order Confirmed
              </div>
              <h2 style="margin: 0 0 8px 0; font-family: 'Georgia', serif; font-size: 24px; font-weight: 400; color: #0c0a09;">
                Thank you for your purchase
              </h2>
              <p style="margin: 0; font-size: 14px; color: #57534e; line-height: 1.6;">
                Your payment for order <strong>#${orderNum}</strong> placed on ${orderDate} has been confirmed. Our atelier craftsmen are preparing your garment with the highest care.
              </p>
            </td>
          </tr>

          <!-- Order Summary Details -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafaf9; border-bottom: 1px solid #e7e5e4;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="50%" style="font-size: 12px; color: #78716c; line-height: 1.6; padding-right: 12px;">
                    <strong style="color: #1c1917; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; display: block; margin-bottom: 4px;">Order Details</strong>
                    Order: <strong style="color: #1c1917;">#${orderNum}</strong><br />
                    Payment: <span style="color: #166534; font-weight: 600;">Paid (${order.paymentMethod === 'razorpay' ? 'Razorpay Secure' : (order.paymentMethod || 'Online')})</span><br />
                    ${order.razorpay?.paymentId ? `Payment ID: <span style="font-family: monospace; font-size: 11px;">${order.razorpay.paymentId}</span><br />` : ''}
                    Date: ${orderDate}
                  </td>
                  <td valign="top" width="50%" style="font-size: 12px; color: #78716c; line-height: 1.6; padding-left: 12px;">
                    <strong style="color: #1c1917; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; display: block; margin-bottom: 4px;">Shipping Address</strong>
                    ${formattedAddress || 'Customer Address'}<br />
                    ${shippingAddr.phone ? `Phone: ${shippingAddr.phone}` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Itemized Products -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #78716c; margin-bottom: 12px;">
                Order Summary (${items.length} ${items.length === 1 ? 'item' : 'items'})
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
              </table>

              <!-- Pricing Calculation -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; border-top: 1px solid #f5f5f4; padding-top: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1c1917; font-weight: 500;">
                    ₹${Number(order.subtotal || order.total).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Shipping & Handling</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1c1917;">
                    ${order.shippingFee === 0 || !order.shippingFee ? '<span style="color: #166534; font-weight: 600;">Complimentary</span>' : `₹${Number(order.shippingFee).toLocaleString('en-IN')}`}
                  </td>
                </tr>
                ${
                  order.discount
                    ? `<tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #166534;">Promotional Savings</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; color: #166534; font-weight: 600;">
                          -₹${Number(order.discount).toLocaleString('en-IN')}
                        </td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 14px 0 0 0; font-size: 16px; font-weight: 700; color: #0c0a09; border-top: 2px solid #0c0a09;">Total Amount Paid</td>
                  <td align="right" style="padding: 14px 0 0 0; font-size: 20px; font-weight: 700; color: #0c0a09; border-top: 2px solid #0c0a09;">
                    ₹${Number(order.total).toLocaleString('en-IN')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tracking Call To Action -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 20px;">
                <p style="margin: 0 0 14px 0; font-size: 13px; color: #57534e;">
                  Tracking Reference: <strong style="color: #0c0a09; font-family: monospace; font-size: 14px;">${order.trackingNumber || 'VEL-DISPATCH-' + Date.now().toString().slice(-6)}</strong>
                </p>
                <a href="${trackingLink}" style="display: inline-block; padding: 14px 32px; background-color: #0c0a09; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                  Track Your Shipment
                </a>
              </div>
            </td>
          </tr>

          <!-- Concierge Support -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #78716c; line-height: 1.6;">
                Need styling advice or order adjustments? Reply directly to this email or contact our atelier concierge at <a href="mailto:concierge@veloura.store" style="color: #0c0a09; font-weight: 600; text-decoration: underline;">concierge@veloura.store</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f4; padding: 24px 32px; text-align: center; border-top: 1px solid #e7e5e4; font-size: 11px; color: #a8a29e; line-height: 1.6;">
              <p style="margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; color: #78716c;">VELOURA Atelier &amp; Luxury Boutiques</p>
              <p style="margin: 0;">128 Rue du Faubourg Saint-Honoré, Paris &bull; Fifth Avenue, New York &bull; Mayfair, London</p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #a8a29e;">&copy; ${new Date().getFullYear()} VELOURA. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * Sends order confirmation email to the user upon successful payment
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    let recipientEmail =
      order.shippingAddress?.email ||
      order.guestEmail ||
      order.email ||
      order.customerEmail ||
      (order.user && typeof order.user === 'object' ? order.user.email : null);

    // If recipient email is not directly on order, resolve userId
    if (!recipientEmail && order.user && typeof order.user === 'string') {
      try {
        if (isDbConnected()) {
          const userDoc = await User.findById(order.user).select('email name');
          if (userDoc?.email) {
            recipientEmail = userDoc.email;
          }
        } else {
          const memUser = memoryDb.users.getById(order.user);
          if (memUser?.email) {
            recipientEmail = memUser.email;
          }
        }
      } catch (lookupErr) {
        console.warn('[Email Service] User lookup notice:', lookupErr.message);
      }
    }

    if (!recipientEmail) {
      console.log(`[Nodemailer] Notice: No recipient email found for order #${order.orderNumber || order._id || order.id}. Skipping dispatch.`);
      return { success: false, reason: 'No recipient email found on order' };
    }

    const orderNum = order.orderNumber || order.id || order._id || 'VEL-ORDER';
    const emailSubject = `Order Confirmation #${orderNum} — Payment Received | VELOURA`;
    const emailHtml = generateOrderConfirmationHtml(order);

    const activeTransporter = getTransporter();

    if (activeTransporter) {
      const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"VELOURA Atelier" <orders@veloura.store>';
      const info = await activeTransporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[Nodemailer] ✓ Order confirmation email delivered to ${recipientEmail} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId, recipient: recipientEmail };
    } else {
      // Safe development preview mode with detailed log
      console.log(`\n================== [NODEMAILER ORDER CONFIRMATION DISPATCH] ==================`);
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Order Number: #${orderNum}`);
      console.log(`Total Amount: ₹${Number(order.total).toLocaleString('en-IN')}`);
      console.log(`Payment Method: ${order.paymentMethod || 'Razorpay'} (${order.paymentStatus || 'paid'})`);
      console.log(`Items (${(order.items || []).length}):`);
      (order.items || []).forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.productName || 'Item'} | Size: ${item.size || 'M'} | Color: ${item.color?.name || 'Standard'} | Qty: ${item.quantity} | ₹${Number(item.price * item.quantity).toLocaleString('en-IN')}`);
      });
      console.log(`Shipping Address: ${order.shippingAddress?.fullName || 'Customer'}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''}`);
      console.log(`Note: Configure SMTP_HOST/SMTP_USER or GMAIL_USER/GMAIL_APP_PASSWORD in .env for live inbox transmission.`);
      console.log(`===============================================================================\n`);
      return { success: true, mode: 'preview-logged', recipient: recipientEmail };
    }
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send order confirmation email:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a test email to verify Nodemailer setup
 */
export const sendTestEmail = async (targetEmail) => {
  const testOrder = {
    orderNumber: `VEL-TEST-${Date.now().toString().slice(-4)}`,
    createdAt: new Date(),
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    subtotal: 1250,
    shippingFee: 0,
    discount: 100,
    total: 1150,
    trackingNumber: `1ZTEST${Math.floor(10000000 + Math.random() * 90000000)}`,
    shippingAddress: {
      fullName: 'Valued Atelier Patron',
      email: targetEmail,
      addressLine1: '742 Evergreen Terrace',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75008',
      country: 'France',
    },
    items: [
      {
        productName: 'Double-Faced Cashmere Overcoat',
        size: 'M',
        color: { name: 'Camel Melange', hex: '#C19A6B' },
        quantity: 1,
        price: 890,
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      },
      {
        productName: 'Silk-Blend Structured Blazer',
        size: 'M',
        color: { name: 'Onyx Black', hex: '#121212' },
        quantity: 1,
        price: 360,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      },
    ],
  };

  return await sendOrderConfirmationEmail(testOrder);
};

