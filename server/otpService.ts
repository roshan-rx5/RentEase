import { storage } from './storage';
import { sendWebhookEmail, generateSimpleOtpText } from "./webhookEmail";
import { PushNotificationService } from "./pushNotifications";

// Generate a random 4-digit OTP
export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP via email notification system
export async function sendOtpEmail(email: string, otp: string, purpose: 'login' | 'signup'): Promise<boolean> {
  try {
    const subject = `RentFlow Verification Code: ${otp}`;
    const text = generateSimpleOtpText(email, otp, purpose);
    
    const emailSent = await sendWebhookEmail(email, subject, text);
    
    if (!emailSent) {
      // Fallback: simple console log
      console.log(`\n🔐 OTP for ${email} (${purpose}): ${otp}\n`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send OTP notification:', error);
    // Fallback: log to console
    console.log(`\n🔐 OTP for ${email} (${purpose}): ${otp}\n`);
    return true; // Still return true to not block the flow
  }
}

// Create and send OTP
export async function createAndSendOtp(userId: string, email: string, purpose: 'login' | 'signup'): Promise<boolean> {
  try {
    // Clean up expired OTPs
    await storage.cleanupExpiredOtps();
    
    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    
    // Save OTP to database
    await storage.createOtp({
      userId,
      otp,
      purpose,
      expiresAt,
      isUsed: false
    });
    
    // Send OTP via email and push notification
    const emailSent = await sendOtpEmail(email, otp, purpose);
    
    // Also send push notification if user has registered devices
    try {
      await PushNotificationService.sendOtpNotification(userId, otp, purpose);
    } catch (error) {
      console.log('Push notification failed (user may not have mobile app):', error);
      // Don't fail the flow if push notification fails
    }
    
    return emailSent;
  } catch (error) {
    console.error('Error creating/sending OTP:', error);
    return false;
  }
}

// Verify OTP
export async function verifyUserOtp(userId: string, otp: string, purpose: string): Promise<boolean> {
  try {
    const isValid = await storage.verifyOtp(userId, otp, purpose);
    
    if (isValid && purpose === 'signup') {
      // Mark user as verified for signup
      await storage.updateUser(userId, { isVerified: true });
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}