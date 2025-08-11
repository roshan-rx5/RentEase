// Mobile API endpoints for the companion app
import type { Express } from "express";
import { PushNotificationService } from './pushNotifications';
import { isAuthenticated } from './auth';
import { storage } from './storage';
import { z } from 'zod';

// Validation schemas for mobile API
const registerDeviceSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
  platform: z.enum(['ios', 'android', 'web']),
  deviceInfo: z.object({
    model: z.string().optional(),
    osVersion: z.string().optional(),
    appVersion: z.string().optional()
  }).optional()
});

const sendTestNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['rental_reminder', 'booking_confirmed', 'payment_due', 'rental_returned', 'otp_verification', 'order_status']).optional()
});

export function registerMobileRoutes(app: Express): void {
  // Register device for push notifications
  app.post('/api/mobile/register-device', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = registerDeviceSchema.parse(req.body);
      
      const success = await PushNotificationService.registerDevice(
        user.id,
        validatedData.token,
        validatedData.platform
      );
      
      if (success) {
        res.json({ 
          success: true, 
          message: 'Device registered successfully for push notifications',
          deviceInfo: validatedData.deviceInfo
        });
      } else {
        res.status(500).json({ success: false, message: 'Failed to register device' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      console.error('Error registering device:', error);
      res.status(500).json({ success: false, message: 'Failed to register device' });
    }
  });

  // Unregister device
  app.post('/api/mobile/unregister-device', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ success: false, message: 'Device token is required' });
      }
      
      const success = await PushNotificationService.unregisterDevice(user.id, token);
      
      if (success) {
        res.json({ success: true, message: 'Device unregistered successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to unregister device' });
      }
    } catch (error) {
      console.error('Error unregistering device:', error);
      res.status(500).json({ success: false, message: 'Failed to unregister device' });
    }
  });

  // Get user's registered devices
  app.get('/api/mobile/devices', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const devices = PushNotificationService.getUserDevices(user.id);
      
      res.json({ 
        success: true, 
        devices: devices.map(device => ({
          platform: device.platform,
          token: device.token.substring(0, 20) + '...', // Masked token for security
          isActive: device.isActive
        }))
      });
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch devices' });
    }
  });

  // Send test notification (for development/testing)
  app.post('/api/mobile/test-notification', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = sendTestNotificationSchema.parse(req.body);
      
      const success = await PushNotificationService.sendNotification({
        userId: user.id,
        title: validatedData.title,
        body: validatedData.message,
        type: validatedData.type || 'order_status',
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      if (success) {
        res.json({ success: true, message: 'Test notification sent successfully' });
      } else {
        res.status(500).json({ success: false, message: 'No registered devices found' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      console.error('Error sending test notification:', error);
      res.status(500).json({ success: false, message: 'Failed to send test notification' });
    }
  });

  // Get notification history
  app.get('/api/mobile/notifications', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const notifications = await storage.getUserNotifications(user.id, limit, offset);
      
      res.json({ 
        success: true, 
        notifications,
        pagination: {
          page,
          limit,
          hasMore: notifications.length === limit
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  });

  // Mark notification as read
  app.post('/api/mobile/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const notificationId = req.params.id;
      
      const success = await storage.markNotificationAsRead(notificationId, user.id);
      
      if (success) {
        res.json({ success: true, message: 'Notification marked as read' });
      } else {
        res.status(404).json({ success: false, message: 'Notification not found' });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
  });

  // Get mobile app configuration
  app.get('/api/mobile/config', async (req, res) => {
    try {
      res.json({
        success: true,
        config: {
          appName: 'RentFlow',
          version: '1.0.0',
          features: {
            pushNotifications: true,
            realTimeUpdates: true,
            otpVerification: true,
            paymentIntegration: false, // Since Stripe was removed
            darkMode: true
          },
          endpoints: {
            api: '/api',
            auth: '/api/auth',
            mobile: '/api/mobile'
          },
          pushNotificationTypes: [
            'rental_reminder',
            'booking_confirmed', 
            'payment_due',
            'rental_returned',
            'otp_verification',
            'order_status'
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching mobile config:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch configuration' });
    }
  });

  // Health check for mobile app
  app.get('/api/mobile/health', async (req, res) => {
    try {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          notifications: 'active',
          authentication: 'active'
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({ 
        success: false, 
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  });
}