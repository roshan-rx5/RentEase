import { storage } from './storage';

// Generate a random 4-digit OTP
export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP via email (for now, just log it - can be replaced with actual email service)
export async function sendOtpEmail(email: string, otp: string, purpose: string): Promise<boolean> {
  // In production, replace this with actual email sending service
  console.log(`\n🔐 OTP for ${email} (${purpose}): ${otp}\n`);
  
  // Simulate email sending success
  return true;
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
    
    // Send OTP via email (or log for development)
    return await sendOtpEmail(email, otp, purpose);
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