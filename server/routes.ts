import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hashPassword } from "./auth";
import {
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertNotificationSchema,
  registerUserSchema,
  loginUserSchema,
  insertInvoiceSchema,
  insertDepositSchema,
  insertPaymentSchema,
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login session error" });
          }
          
          // Remove password from response
          const { password, ...userResponse } = user;
          res.json(userResponse);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login validation error" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Legacy login route for compatibility
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Admin route handler
  app.get('/admin', (req, res) => {
    res.redirect('/');
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let products;
      if (startDate && endDate) {
        products = await storage.getAvailableProducts(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAdmin, async (req: any, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      let orders;
      
      if (user?.role === 'admin') {
        orders = await storage.getOrders();
      } else {
        orders = await storage.getOrders(user.id);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && order.customerId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderNumber = await storage.generateOrderNumber();
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        orderNumber,
        customerId: req.user.claims.sub,
      });
      
      const order = await storage.createOrder(validatedData);
      
      // Add order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id,
          });
          await storage.addOrderItem(validatedItem);
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && order.customerId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertOrderSchema.partial().parse(req.body);
      const updatedOrder = await storage.updateOrder(req.params.id, validatedData);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const notifications = await storage.getNotifications(req.user.claims.sub);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, orderId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
        metadata: {
          orderId: orderId || '',
          userId: req.user.id,
        },
      });

      // Update order with payment intent ID if order exists
      if (orderId) {
        await storage.updateOrder(orderId, {
          stripePaymentIntentId: paymentIntent.id,
        });
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook for Stripe payment confirmations
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      // In production, verify the webhook signature here
      const event = req.body;

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await storage.updateOrder(orderId, {
            paymentStatus: 'paid',
            status: 'confirmed',
          });

          // Create notification for successful payment
          await storage.createNotification({
            userId: paymentIntent.metadata.userId,
            title: 'Payment Successful',
            message: `Payment of ₹${(paymentIntent.amount / 100).toLocaleString()} has been received for your order.`,
            type: 'success',
            relatedOrderId: orderId,
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Invoice management routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const customerId = req.user?.role === 'admin' ? undefined : req.user?.id;
      const invoices = await storage.getInvoices(customerId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (req.user.role !== 'admin' && invoice.customerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices/generate/:orderId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const existingInvoice = await storage.getInvoiceByOrder(req.params.orderId);
      if (existingInvoice) {
        return res.status(400).json({ message: "Invoice already exists for this order" });
      }

      const invoiceNumber = await storage.generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await storage.createInvoice({
        invoiceNumber,
        orderId: order.id,
        customerId: order.customerId,
        dueDate,
        subtotal: order.totalAmount,
        taxAmount: '0',
        totalAmount: order.totalAmount,
        status: 'sent'
      });

      res.json(invoice);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  app.post('/api/invoices/:id/pay', isAuthenticated, async (req, res) => {
    try {
      const { amount, paymentType = 'partial' } = req.body;
      const invoice = await storage.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      if (req.user?.role !== 'admin' && invoice.customerId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const paymentAmount = paymentType === 'full' ? Number(invoice.totalAmount) : amount;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(paymentAmount * 100),
        currency: "inr",
        metadata: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          type: 'invoice_payment'
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: paymentAmount
      });
    } catch (error) {
      console.error("Error creating payment for invoice:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Deposit payment route
  app.post('/api/deposits/:orderId/pay', isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (req.user?.role !== 'admin' && order.customerId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const depositAmount = order.securityDeposit || '0';
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(depositAmount) * 100),
        currency: "inr",
        metadata: {
          orderId: order.id,
          customerId: order.customerId,
          type: 'security_deposit'
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: Number(depositAmount)
      });
    } catch (error) {
      console.error("Error creating deposit payment:", error);
      res.status(500).json({ message: "Failed to process deposit payment" });
    }
  });

  // Reports routes
  app.get('/api/reports/revenue', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = {
        totalRevenue: 0,
        rentalRevenue: 0,
        depositRevenue: 0,
        lateFeeRevenue: 0,
        refundAmount: 0
      };
      res.json(report);
    } catch (error) {
      console.error("Error generating revenue report:", error);
      res.status(500).json({ message: "Failed to generate revenue report" });
    }
  });

  app.get('/api/reports/products', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const report: any[] = [];
      res.json(report);
    } catch (error) {
      console.error("Error generating product report:", error);
      res.status(500).json({ message: "Failed to generate product report" });
    }
  });

  app.get('/api/reports/customers', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const report: any[] = [];
      res.json(report);
    } catch (error) {
      console.error("Error generating customer report:", error);
      res.status(500).json({ message: "Failed to generate customer report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
