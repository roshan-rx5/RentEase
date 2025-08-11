import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not found. Email functionality will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would be sent to:', params.to, 'Subject:', params.subject);
    return false;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function generateOrderConfirmationEmail(order: any, user: any): string {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDurationDays = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const itemsTotal = order.orderItems.reduce((sum: number, item: any) => {
    return sum + Number(item.totalAmount);
  }, 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - RentFlow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .order-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; text-align: right; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛠️ RentFlow</div>
          <h1>Payment Confirmation & Rental Ticket</h1>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <div class="success-badge">✅ Payment Successful</div>
            <h2>Thank you for your payment, ${user.name}!</h2>
            <p>Your rental order has been confirmed and is ready for pickup.</p>
          </div>

          <div class="order-details">
            <h3>📋 Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td><strong>Order Number:</strong></td>
                <td style="text-align: right;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td><strong>Order Date:</strong></td>
                <td style="text-align: right;">${formatDate(order.createdAt)}</td>
              </tr>
              <tr>
                <td><strong>Rental Period:</strong></td>
                <td style="text-align: right;">
                  ${formatDate(order.startDate)} - ${formatDate(order.endDate)}
                  <br><small>(${getDurationDays(order.startDate, order.endDate)} days)</small>
                </td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td style="text-align: right;"><span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PAID</span></td>
              </tr>
            </table>
          </div>

          <div class="order-details">
            <h3>📦 Rental Items</h3>
            ${order.orderItems.map((item: any) => `
              <div class="item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${item.product.name}</strong>
                    <br>
                    <small style="color: #6b7280;">Quantity: ${item.quantity} × ₹${Number(item.unitRate).toLocaleString()}</small>
                  </div>
                  <div style="font-weight: bold;">
                    ₹${Number(item.totalAmount).toLocaleString()}
                  </div>
                </div>
              </div>
            `).join('')}
            
            ${order.securityDeposit && Number(order.securityDeposit) > 0 ? `
              <div class="item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>Security Deposit</strong>
                    <br>
                    <small style="color: #6b7280;">(Refundable upon return)</small>
                  </div>
                  <div style="font-weight: bold;">
                    ₹${Number(order.securityDeposit).toLocaleString()}
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="total">
              Total Amount Paid: ₹${Number(order.totalAmount).toLocaleString()}
            </div>
          </div>

          ${order.pickupAddress || order.returnAddress ? `
            <div class="order-details">
              <h3>📍 Pickup & Return Information</h3>
              ${order.pickupAddress ? `
                <div style="margin-bottom: 15px;">
                  <strong>Pickup Address:</strong><br>
                  <span style="color: #6b7280;">${order.pickupAddress}</span>
                </div>
              ` : ''}
              ${order.returnAddress ? `
                <div>
                  <strong>Return Address:</strong><br>
                  <span style="color: #6b7280;">${order.returnAddress}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="order-details">
            <h3>⚠️ Important Information</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Pickup:</strong> Please bring this email confirmation and a valid ID</li>
              <li><strong>Return:</strong> Items must be returned by ${formatDate(order.endDate)} to avoid late fees</li>
              <li><strong>Condition:</strong> Please return items in the same condition as received</li>
              <li><strong>Support:</strong> Contact us for any questions or to extend rental period</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/orders` : '#'}" class="btn">
              View Order Status
            </a>
          </div>
        </div>

        <div class="footer">
          <p><strong>RentFlow - Professional Equipment Rental</strong></p>
          <p>This is your official rental ticket and payment receipt.</p>
          <p>Keep this email for your records and present it during pickup.</p>
          <p>Need help? Contact us at support@rentflow.com or call us at +91-XXXX-XXXX</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generatePaymentReceiptEmail(order: any, user: any, paymentDetails: any): string {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - RentFlow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .receipt-details { background: #f0fdf4; padding: 20px; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
        .row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💳 RentFlow</div>
          <h1>Payment Receipt</h1>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2>Payment Successful</h2>
            <p>Your payment has been processed successfully.</p>
          </div>

          <div class="receipt-details">
            <h3>💳 Payment Details</h3>
            <div class="row">
              <span>Transaction ID:</span>
              <span>${paymentDetails.id || 'N/A'}</span>
            </div>
            <div class="row">
              <span>Payment Date:</span>
              <span>${formatDate(new Date())}</span>
            </div>
            <div class="row">
              <span>Payment Method:</span>
              <span>Credit/Debit Card</span>
            </div>
            <div class="row">
              <span>Order Number:</span>
              <span>${order.orderNumber}</span>
            </div>
            <div class="row">
              <span>Amount Paid:</span>
              <span>₹${Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <p><strong>Receipt Number: REC-${Date.now()}</strong></p>
            <p>This serves as your official payment receipt.</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>RentFlow - Professional Equipment Rental</strong></p>
          <p>Thank you for choosing RentFlow for your equipment rental needs.</p>
          <p>This is an automated receipt. Please save it for your records.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}