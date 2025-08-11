import { storage } from './storage';

// Push notification service for mobile app companion
export interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'rental_reminder' | 'booking_confirmed' | 'payment_due' | 'rental_returned' | 'otp_verification' | 'order_status';
}

export interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
}

// Store device tokens for push notifications
const deviceTokens = new Map<string, DeviceToken[]>();

export class PushNotificationService {
  // Register a device token for push notifications
  static async registerDevice(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<boolean> {
    try {
      const userTokens = deviceTokens.get(userId) || [];
      
      // Check if token already exists
      const existingToken = userTokens.find(t => t.token === token);
      if (existingToken) {
        existingToken.isActive = true;
        existingToken.platform = platform;
        return true;
      }
      
      // Add new token
      userTokens.push({
        userId,
        token,
        platform,
        isActive: true
      });
      
      deviceTokens.set(userId, userTokens);
      
      console.log(`📱 Device registered for user ${userId}: ${platform} - ${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('Failed to register device:', error);
      return false;
    }
  }

  // Send push notification to user's devices
  static async sendNotification(notification: PushNotificationData): Promise<boolean> {
    try {
      const userTokens = deviceTokens.get(notification.userId);
      if (!userTokens || userTokens.length === 0) {
        console.log(`📱 No devices registered for user ${notification.userId}`);
        return false;
      }

      const activeTokens = userTokens.filter(token => token.isActive);
      if (activeTokens.length === 0) {
        console.log(`📱 No active devices for user ${notification.userId}`);
        return false;
      }

      // Simulate push notification sending (in production, use FCM, APNS, etc.)
      for (const token of activeTokens) {
        await this.sendToDevice(token, notification);
      }

      // Store notification in database for history
      await this.storeNotification(notification);

      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Send to specific device (simulated)
  private static async sendToDevice(device: DeviceToken, notification: PushNotificationData): Promise<void> {
    const platformIcon = device.platform === 'ios' ? '📱' : device.platform === 'android' ? '🤖' : '💻';
    
    console.log(`\n${platformIcon} PUSH NOTIFICATION ${platformIcon}`);
    console.log('═══════════════════════════════════════');
    console.log(`📮 To: ${device.platform.toUpperCase()} Device`);
    console.log(`🔗 Token: ${device.token.substring(0, 20)}...`);
    console.log(`📋 Title: ${notification.title}`);
    console.log(`📄 Message: ${notification.body}`);
    console.log(`🏷️  Type: ${notification.type}`);
    if (notification.data) {
      console.log(`📊 Data: ${JSON.stringify(notification.data, null, 2)}`);
    }
    console.log('═══════════════════════════════════════\n');

    // In production, you would use:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNS) for iOS
    // - Web Push API for web browsers
  }

  // Store notification in database
  private static async storeNotification(notification: PushNotificationData): Promise<void> {
    try {
      await storage.createNotification({
        userId: notification.userId,
        title: notification.title,
        message: notification.body,
        type: notification.type,
        data: notification.data ? JSON.stringify(notification.data) : null,
        isRead: false
      });
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  // Get all devices for a user
  static getUserDevices(userId: string): DeviceToken[] {
    return deviceTokens.get(userId) || [];
  }

  // Remove device token
  static async unregisterDevice(userId: string, token: string): Promise<boolean> {
    try {
      const userTokens = deviceTokens.get(userId);
      if (!userTokens) return false;

      const tokenIndex = userTokens.findIndex(t => t.token === token);
      if (tokenIndex === -1) return false;

      userTokens[tokenIndex].isActive = false;
      console.log(`📱 Device unregistered for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to unregister device:', error);
      return false;
    }
  }

  // Send rental reminders
  static async sendRentalReminder(userId: string, productName: string, dueDate: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Rental Due Soon',
      body: `Your rental "${productName}" is due on ${dueDate}. Please return it on time to avoid late fees.`,
      type: 'rental_reminder',
      data: {
        productName,
        dueDate,
        action: 'view_rental'
      }
    });
  }

  // Send booking confirmation
  static async sendBookingConfirmation(userId: string, productName: string, bookingId: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Booking Confirmed',
      body: `Your booking for "${productName}" has been confirmed. Check your orders for details.`,
      type: 'booking_confirmed',
      data: {
        productName,
        bookingId,
        action: 'view_booking'
      }
    });
  }

  // Send payment due notification
  static async sendPaymentDue(userId: string, amount: string, invoiceId: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Payment Due',
      body: `You have a payment of $${amount} due. Tap to pay now.`,
      type: 'payment_due',
      data: {
        amount,
        invoiceId,
        action: 'pay_invoice'
      }
    });
  }

  // Send OTP notification
  static async sendOtpNotification(userId: string, otp: string, purpose: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Verification Code',
      body: `Your RentFlow verification code is: ${otp}`,
      type: 'otp_verification',
      data: {
        otp,
        purpose,
        action: 'verify_otp'
      }
    });
  }

  // Send order status update
  static async sendOrderStatusUpdate(userId: string, orderId: string, status: string): Promise<void> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      picked_up: 'Your rental items have been picked up. Enjoy!',
      returned: 'Thank you for returning your rental items.',
      cancelled: 'Your order has been cancelled.'
    };

    await this.sendNotification({
      userId,
      title: 'Order Update',
      body: statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to: ${status}`,
      type: 'order_status',
      data: {
        orderId,
        status,
        action: 'view_order'
      }
    });
  }
}