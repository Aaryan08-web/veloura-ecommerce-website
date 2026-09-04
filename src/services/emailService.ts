import nodemailer from 'nodemailer';
import type { Transporter, SentMessageInfo } from 'nodemailer';

/**
 * Interface representing order data for email confirmation
 */
export interface OrderEmailData {
  id?: string;
  _id?: string;
  orderNumber?: string;
  user?: { id?: string; _id?: string; name?: string; email?: string } | string;
  email?: string;
  guestEmail?: string;
  customerEmail?: string;
  items?: Array<{
    productId?: string;
    product?: string | { _id?: string; name?: string; price?: number; images?: string[] };
    productName?: string;
    name?: string;
    price: number;
    quantity: number;
    size?: string;
    color?: { name?: string; hex?: string } | string;
    image?: string;
  }>;
  subtotal?: number;
  shipping?: number;
  shippingFee?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  razorpay?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };
  shippingAddress?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    zipCode?: string;
    country?: string;
  };
  deliveryMethod?: string;
  trackingNumber?: string;
  createdAt?: string | Date;
}

/**
 * Singleton Nodemailer Transporter instance
 */
let transporter: Transporter<SentMessageInfo> | null = null;

/**
 * Initializes and retrieves the Nodemailer transporter based on environment variables
 */
export const getTransporter = (): Transporter<SentMessageInfo> | null => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`[Nodemailer] Configured Custom SMTP transporter (${host}:${port}, secure=${isSecure})`);
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
 * Formats full shipping address for display
 */
const formatAddress = (address?: OrderEmailData['shippingAddress']): string => {
  if (!address) return 'Standard Shipping Destination';
  const name = address.fullName || `${address.firstName || ''} ${address.lastName || ''}`.trim();
  const street = address.addressLine1 || address.street || '';
  const street2 = address.addressLine2 ? `, ${address.addressLine2}` : '';
  const cityState = [address.city, address.state, address.postalCode || address.zipCode].filter(Boolean).join(', ');
  const country = address.country || '';

  return [name, street + street2, cityState, country].filter(Boolean).join('<br />');
};

/**
 * Constructs a luxury, responsive HTML email template for order confirmation
 */
export const generateOrderConfirmationHtml = (orderData: OrderEmailData): string => {
  const items = orderData.items || [];
  const orderId = orderData.orderNumber || orderData.id || orderData._id || `VEL-${Date.now().toString().slice(-6)}`;
  
  const orderDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const appBaseUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000';
  const trackingLink = `${appBaseUrl}/track-order/${orderId}`;
  const trackingNumber = orderData.trackingNumber || `VEL-EXP-${Date.now().toString().slice(-6)}`;

  // Generate itemized table rows
  const itemsHtml = items
    .map((item) => {
      const prodName = item.productName || item.name || (typeof item.product === 'object' ? item.product?.name : 'Luxury Atelier Piece') || 'Luxury Atelier Piece';
      const colorName = typeof item.color === 'object' ? item.color?.name : item.color || '';
      const imageUrl = item.image || (typeof item.product === 'object' && item.product?.images?.[0] ? item.product.images[0] : '');
      const itemPrice = Number(item.price || 0);
      const itemQty = Number(item.quantity || 1);
      const itemTotal = itemPrice * itemQty;

      return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f4;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${
                imageUrl
                  ? `<td width="68" valign="top" style="padding-right: 16px;">
                      <img src="${imageUrl}" alt="${prodName}" width="68" height="88" style="display:block; object-fit:cover; border-radius: 4px; border: 1px solid #e7e5e4;" />
                     </td>`
                  : ''
              }
              <td valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="font-size: 14px; font-weight: 600; color: #1c1917; margin-bottom: 4px; line-height: 1.3;">
                  ${prodName}
                </div>
                <div style="font-size: 12px; color: #78716c; margin-bottom: 6px;">
                  ${item.size ? `Size: <strong style="color: #1c1917;">${item.size}</strong> &nbsp;•&nbsp; ` : ''}
                  ${colorName ? `Color: <strong style="color: #1c1917;">${colorName}</strong> &nbsp;•&nbsp; ` : ''}
                  Qty: <strong style="color: #1c1917;">${itemQty}</strong>
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #1c1917;">
                  ₹${itemPrice.toLocaleString('en-IN')} ${itemQty > 1 ? `<span style="font-size: 11px; font-weight: 400; color: #78716c;">(Total: ₹${itemTotal.toLocaleString('en-IN')})</span>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `;
    })
    .join('');

  const shippingFee = Number(orderData.shippingFee ?? orderData.shipping ?? 0);
  const discountAmount = Number(orderData.discount || 0);
  const subtotalAmount = Number(orderData.subtotal || (Number(orderData.total) - shippingFee + discountAmount));
  const totalAmount = Number(orderData.total || 0);
  const paymentMethodLabel = orderData.paymentMethod === 'razorpay' ? 'Razorpay Secure Payment' : (orderData.paymentMethod || 'Online Payment');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment & Order Confirmation #${orderId} - VELOURA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafaf9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
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

          <!-- Confirmation Status -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f5f5f4;">
              <div style="display: inline-block; padding: 6px 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #166534; text-transform: uppercase; margin-bottom: 16px;">
                ✓ Payment Verified &amp; Order Confirmed
              </div>
              <h2 style="margin: 0 0 8px 0; font-family: 'Georgia', serif; font-size: 24px; font-weight: 400; color: #0c0a09;">
                Thank you for your purchase
              </h2>
              <p style="margin: 0; font-size: 14px; color: #57534e; line-height: 1.6;">
                Your payment for order <strong style="color: #0c0a09;">#${orderId}</strong> placed on ${orderDate} has been confirmed. Our atelier craftsmen are preparing your garment with the highest care.
              </p>
            </td>
          </tr>

          <!-- Order Summary Metadata Box -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafaf9; border-bottom: 1px solid #e7e5e4;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="50%" style="font-size: 12px; color: #78716c; line-height: 1.6; padding-right: 12px;">
                    <strong style="color: #1c1917; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; display: block; margin-bottom: 4px;">Order Details</strong>
                    Order ID: <strong style="color: #1c1917;">#${orderId}</strong><br />
                    Payment: <span style="color: #166534; font-weight: 600;">Paid (${paymentMethodLabel})</span><br />
                    ${orderData.razorpay?.paymentId ? `Payment ID: <span style="font-family: monospace; font-size: 11px; color: #1c1917;">${orderData.razorpay.paymentId}</span><br />` : ''}
                    Date: ${orderDate}
                  </td>
                  <td valign="top" width="50%" style="font-size: 12px; color: #78716c; line-height: 1.6; padding-left: 12px;">
                    <strong style="color: #1c1917; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; display: block; margin-bottom: 4px;">Shipping Address</strong>
                    ${formatAddress(orderData.shippingAddress)}<br />
                    ${orderData.shippingAddress?.phone ? `Phone: ${orderData.shippingAddress.phone}` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Itemized Ordered Products -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #78716c; margin-bottom: 12px;">
                Ordered Products (${items.length} ${items.length === 1 ? 'item' : 'items'})
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
              </table>

              <!-- Pricing Calculation & Total Amount -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; border-top: 1px solid #f5f5f4; padding-top: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1c1917; font-weight: 500;">
                    ₹${subtotalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Shipping &amp; Handling</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1c1917;">
                    ${shippingFee === 0 ? '<span style="color: #166534; font-weight: 600;">Complimentary</span>' : `₹${shippingFee.toLocaleString('en-IN')}`}
                  </td>
                </tr>
                ${
                  discountAmount > 0
                    ? `<tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #166534;">Promotional Savings</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; color: #166534; font-weight: 600;">
                          -₹${discountAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 14px 0 0 0; font-size: 16px; font-weight: 700; color: #0c0a09; border-top: 2px solid #0c0a09;">
                    Total Amount Paid
                  </td>
                  <td align="right" style="padding: 14px 0 0 0; font-size: 20px; font-weight: 700; color: #0c0a09; border-top: 2px solid #0c0a09;">
                    ₹${totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tracking Link CTA -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 20px;">
                <p style="margin: 0 0 14px 0; font-size: 13px; color: #57534e;">
                  Tracking Reference: <strong style="color: #0c0a09; font-family: monospace; font-size: 14px;">${trackingNumber}</strong>
                </p>
                <a href="${trackingLink}" style="display: inline-block; padding: 14px 32px; background-color: #0c0a09; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                  Track Your Shipment
                </a>
              </div>
            </td>
          </tr>

          <!-- Concierge Support Note -->
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
  `.trim();
};

/**
 * Triggers an automated email confirmation to users upon successful payment,
 * detailing the order summary, products, order ID, and total amount.
 *
 * @param orderData - Order payload containing items, totals, payment details, and recipient address.
 * @returns Result object indicating status, message ID, or preview logging details.
 */
export async function sendOrderConfirmation(orderData: any): Promise<{
  success: boolean;
  messageId?: string;
  recipient?: string;
  mode?: string;
  error?: string;
  reason?: string;
}> {
  try {
    // Resolve recipient email address
    const recipientEmail: string | undefined =
      orderData.shippingAddress?.email ||
      orderData.guestEmail ||
      orderData.email ||
      orderData.customerEmail ||
      (typeof orderData.user === 'object' ? orderData.user?.email : undefined);

    const orderId = orderData.orderNumber || orderData.id || orderData._id || 'VEL-ORDER';

    if (!recipientEmail) {
      console.warn(`[Nodemailer] Warning: No recipient email provided for order #${orderId}. Skipping dispatch.`);
      return { success: false, reason: 'No recipient email found on order data' };
    }

    const emailSubject = `Order Confirmation #${orderId} — Payment Received | VELOURA`;
    const emailHtml = generateOrderConfirmationHtml(orderData);
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"VELOURA Atelier" <orders@veloura.store>';

    const activeTransporter = getTransporter();

    if (activeTransporter) {
      // Send real email through SMTP or Gmail service
      const info = await activeTransporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[Nodemailer] ✓ Order confirmation email successfully delivered to ${recipientEmail} (MessageId: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: recipientEmail,
        mode: 'live-smtp',
      };
    } else {
      // Safe development preview logger when SMTP credentials are not yet supplied
      console.log(`\n================== [NODEMAILER ORDER CONFIRMATION DISPATCH] ==================`);
      console.log(`To: ${recipientEmail}`);
      console.log(`From: ${fromAddress}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Order ID: #${orderId}`);
      console.log(`Total Amount: ₹${Number(orderData.total || 0).toLocaleString('en-IN')}`);
      console.log(`Payment Method: ${orderData.paymentMethod || 'Razorpay'} (${orderData.paymentStatus || 'paid'})`);
      console.log(`Items (${(orderData.items || []).length}):`);
      (orderData.items || []).forEach((item: any, idx: number) => {
        const pName = item.productName || item.name || 'Item';
        const pPrice = Number(item.price || 0);
        const pQty = Number(item.quantity || 1);
        console.log(`  ${idx + 1}. ${pName} | Size: ${item.size || 'M'} | Qty: ${pQty} | ₹${(pPrice * pQty).toLocaleString('en-IN')}`);
      });
      console.log(`Destination: ${orderData.shippingAddress?.fullName || 'Customer'}, ${orderData.shippingAddress?.city || ''}`);
      console.log(`Notice: Configure SMTP_HOST / SMTP_USER in .env to deliver directly to user's real inbox.`);
      console.log(`===============================================================================\n`);

      return {
        success: true,
        recipient: recipientEmail,
        mode: 'preview-logged',
      };
    }
  } catch (error: any) {
    console.error(`[Nodemailer Error] Failed to send order confirmation email:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error sending email confirmation',
    };
  }
}

/**
 * Helper to verify SMTP server connectivity
 */
export async function verifyEmailConfig(): Promise<{
  configured: boolean;
  status: 'connected' | 'unconfigured' | 'error';
  message: string;
}> {
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
    return {
      configured: true,
      status: 'connected',
      message: 'SMTP Server connection verified successfully.',
    };
  } catch (error: any) {
    console.warn('[Nodemailer Verify Warning]', error.message);
    return {
      configured: true,
      status: 'error',
      message: error.message || 'Failed to verify SMTP server connection',
    };
  }
}

export default {
  sendOrderConfirmation,
  generateOrderConfirmationHtml,
  getTransporter,
  verifyEmailConfig,
};
