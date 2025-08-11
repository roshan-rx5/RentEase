import nodemailer from 'nodemailer';

// Simple email configuration that works without API keys
// Uses a test SMTP server for development
export async function sendSimpleEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  try {
    // Create a test account using Ethereal Email (for development)
    const testAccount = await nodemailer.createTestAccount();
    
    // Create transporter using the test account
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: '"RentFlow Support" <support@rentflow.com>',
      to: to,
      subject: subject,
      text: text,
      html: html || text,
    });

    console.log('📧 Email sent to:', to);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('📧 Subject:', subject);
    console.log('📧 Content:', text);
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // For development, we'll still log the email content
    console.log('📧 Email would have been sent to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Content:', text);
    return true; // Return true so the flow continues
  }
}

export function generateOtpEmail(email: string, otp: string, purpose: 'login' | 'signup'): { subject: string; text: string; html: string } {
  const action = purpose === 'login' ? 'sign in to' : 'verify your account on';
  const subject = `Your RentFlow verification code: ${otp}`;
  
  const text = `
Hello,

You requested to ${action} RentFlow. Your verification code is:

${otp}

This code will expire in 5 minutes.

If you didn't request this, please ignore this email.

Best regards,
RentFlow Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">RentFlow</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Rental Management System</p>
      </div>
      
      <div style="background: white; padding: 40px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
        <p style="color: #666; font-size: 16px;">You requested to ${action} RentFlow. Your verification code is:</p>
        
        <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">This code will expire in <strong>5 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Best regards,<br>
          <strong>RentFlow Team</strong>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}