import {
  users,
  categories,
  products,
  orders,
  orderItems,
  notifications,
  invoices,
  deposits,
  payments,
  validityPeriods,
  lateFees,

  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Notification,
  type InsertNotification,
  type Invoice,
  type InsertInvoice,
  type Deposit,
  type InsertDeposit,
  type Payment,
  type InsertPayment,
  type ValidityPeriod,
  type InsertValidityPeriod,
  type LateFee,
  type InsertLateFee,

  type OrderWithItems,
  type ProductWithCategory,
  type InvoiceWithDetails,
  type DepositWithDetails,
  type PaymentWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, like, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser, id?: string): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  

  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Product operations
  getProducts(): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  getAvailableProducts(startDate: Date, endDate: Date): Promise<ProductWithCategory[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Order operations
  getOrders(userId?: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
  
  // Order item operations
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: string, orderItem: Partial<InsertOrderItem>): Promise<OrderItem>;
  deleteOrderItem(id: string): Promise<void>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  getUserNotifications(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<boolean>;
  
  // Analytics operations
  getDashboardStats(): Promise<{
    activeRentals: number;
    monthlyRevenue: string;
    pendingReturns: number;
    totalCustomers: number;
  }>;
  
  // Invoice operations
  getInvoices(customerId?: string): Promise<InvoiceWithDetails[]>;
  getInvoice(id: string): Promise<InvoiceWithDetails | undefined>;
  getInvoiceByOrder(orderId: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  generateInvoiceNumber(): Promise<string>;
  calculateLateFees(invoiceId: string): Promise<void>;
  
  // Deposit operations
  getDeposits(customerId?: string): Promise<DepositWithDetails[]>;
  getDeposit(id: string): Promise<DepositWithDetails | undefined>;
  getDepositByOrder(orderId: string): Promise<Deposit | undefined>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  updateDeposit(id: string, deposit: Partial<InsertDeposit>): Promise<Deposit>;
  refundDeposit(id: string, refundAmount: number, reason?: string): Promise<Deposit>;
  forfeitDeposit(id: string, forfeitAmount: number, reason: string): Promise<Deposit>;
  
  // Payment operations
  getPayments(customerId?: string, orderId?: string): Promise<PaymentWithDetails[]>;
  getPayment(id: string): Promise<PaymentWithDetails | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;
  processPayment(id: string, stripePaymentIntentId?: string, stripeChargeId?: string): Promise<Payment>;
  
  // Validity period operations
  getValidityPeriods(orderId?: string): Promise<ValidityPeriod[]>;
  createValidityPeriod(validityPeriod: InsertValidityPeriod): Promise<ValidityPeriod>;
  updateValidityPeriod(id: string, validityPeriod: Partial<InsertValidityPeriod>): Promise<ValidityPeriod>;
  extendValidityPeriod(id: string, newEndDate: Date, extensionFee: number): Promise<ValidityPeriod>;
  
  // Late fee operations
  getLateFees(customerId?: string, orderId?: string): Promise<LateFee[]>;
  createLateFee(lateFee: InsertLateFee): Promise<LateFee>;
  updateLateFee(id: string, lateFee: Partial<InsertLateFee>): Promise<LateFee>;
  waiveLateFee(id: string, waivedAmount: number, waivedBy: string, reason: string): Promise<LateFee>;
  payLateFee(id: string): Promise<LateFee>;
  
  // Reports
  getRevenueReport(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    rentalRevenue: number;
    depositRevenue: number;
    lateFeeRevenue: number;
    refundAmount: number;
    revenueByMonth: Array<{ month: string; revenue: number; }>;
  }>;
  getProductReport(): Promise<Array<{
    productId: string;
    productName: string;
    totalRentals: number;
    totalRevenue: number;
    averageRentalDuration: number;
    currentlyRented: number;
  }>>;
  getCustomerReport(): Promise<Array<{
    customerId: string;
    customerName: string;
    customerEmail: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: Date | null;
    status: 'active' | 'inactive';
  }>>;
  
  // Utility operations
  generateOrderNumber(): Promise<string>;

}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser, id?: string): Promise<User> {
    const userDataWithId = id ? { ...userData, id } : userData;
    const [user] = await db
      .insert(users)
      .values(userDataWithId)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, user: Partial<UpsertUser>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }



  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(): Promise<ProductWithCategory[]> {
    return await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(products.name)
      .then(rows => 
        rows.map(row => ({
          ...row.products,
          category: row.categories
        }))
      );
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.products,
      category: result.categories
    };
  }

  async getAvailableProducts(startDate: Date, endDate: Date): Promise<ProductWithCategory[]> {
    const allProducts = await this.getProducts();
    
    // Get all orders that overlap with the requested date range
    const overlappingOrders = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          // Order overlaps with requested period
          lte(orders.startDate, endDate),
          gte(orders.endDate, startDate),
          // Only consider active orders
          sql`${orders.status} IN ('confirmed', 'paid', 'picked_up', 'active')`
        )
      );

    // Calculate reserved quantities per product
    const reservedQuantities = new Map<string, number>();
    for (const order of overlappingOrders) {
      const current = reservedQuantities.get(order.productId) || 0;
      reservedQuantities.set(order.productId, current + order.quantity);
    }

    // Filter products that have available capacity
    return allProducts.filter(product => {
      const reserved = reservedQuantities.get(product.id) || 0;
      const available = (product.totalQuantity || 0) - reserved;
      return available > 0;
    });
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order operations
  async getOrders(userId?: string): Promise<OrderWithItems[]> {
    const query = db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .orderBy(desc(orders.createdAt));

    if (userId) {
      query.where(eq(orders.customerId, userId));
    }

    const results = await query;
    
    // Group results by order
    const orderMap = new Map<string, OrderWithItems>();
    
    for (const row of results) {
      if (!row.orders) continue;
      
      if (!orderMap.has(row.orders.id)) {
        orderMap.set(row.orders.id, {
          ...row.orders,
          customer: row.users!,
          orderItems: []
        });
      }
      
      if (row.order_items && row.products) {
        orderMap.get(row.orders.id)!.orderItems.push({
          ...row.order_items,
          product: row.products
        });
      }
    }
    
    return Array.from(orderMap.values());
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, id));

    if (results.length === 0) return undefined;

    const order = results[0].orders!;
    const customer = results[0].users!;
    
    const items = results
      .filter(row => row.order_items && row.products)
      .map(row => ({
        ...row.order_items!,
        product: row.products!
      }));

    return {
      ...order,
      customer,
      orderItems: items
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deleteOrder(id: string): Promise<void> {
    // Delete order items first
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    // Then delete the order
    await db.delete(orders).where(eq(orders.id, id));
  }

  // Order item operations
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(orderItem).returning();
    return newItem;
  }

  async updateOrderItem(id: string, orderItem: Partial<InsertOrderItem>): Promise<OrderItem> {
    const [updated] = await db
      .update(orderItems)
      .set(orderItem)
      .where(eq(orderItems.id, id))
      .returning();
    return updated;
  }

  async deleteOrderItem(id: string): Promise<void> {
    await db.delete(orderItems).where(eq(orderItems.id, id));
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await db.update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Analytics operations
  async getDashboardStats(): Promise<{
    activeRentals: number;
    monthlyRevenue: string;
    pendingReturns: number;
    totalCustomers: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count active rentals
    const [{ count: activeRentals }] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'active'));

    // Calculate monthly revenue
    const [{ sum: monthlyRevenue }] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfMonth),
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Count pending returns
    const [{ count: pendingReturns }] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'active'),
          lte(orders.endDate, now)
        )
      );

    // Count total customers
    const [{ count: totalCustomers }] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'customer'));

    return {
      activeRentals: activeRentals || 0,
      monthlyRevenue: `₹${Number(monthlyRevenue || 0).toLocaleString()}`,
      pendingReturns: pendingReturns || 0,
      totalCustomers: totalCustomers || 0,
    };
  }

  // Utility operations
  async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const [{ count: orderCount }] = await db
      .select({ count: count() })
      .from(orders)
      .where(like(orders.orderNumber, `RO-${year}-${month}-%`));

    const nextNumber = (orderCount || 0) + 1;
    return `RO-${year}-${month}-${String(nextNumber).padStart(3, '0')}`;
  }



  // Invoice operations
  async getInvoices(customerId?: string): Promise<InvoiceWithDetails[]> {
    let query = db
      .select()
      .from(invoices)
      .leftJoin(orders, eq(invoices.orderId, orders.id))
      .leftJoin(users, eq(invoices.customerId, users.id))
      .leftJoin(payments, eq(invoices.id, payments.invoiceId))
      .orderBy(desc(invoices.createdAt));

    if (customerId) {
      query = query.where(eq(invoices.customerId, customerId)) as any;
    }

    const results = await query;
    const invoiceMap = new Map<string, InvoiceWithDetails>();

    for (const row of results) {
      if (!row.invoices) continue;

      if (!invoiceMap.has(row.invoices.id)) {
        invoiceMap.set(row.invoices.id, {
          ...row.invoices,
          order: {
            ...row.orders!,
            customer: row.users!,
            orderItems: []
          } as OrderWithItems,
          customer: row.users!,
          payments: []
        });
      }

      if (row.payments) {
        invoiceMap.get(row.invoices.id)!.payments.push(row.payments);
      }
    }

    return Array.from(invoiceMap.values());
  }

  async getInvoice(id: string): Promise<InvoiceWithDetails | undefined> {
    const results = await db
      .select()
      .from(invoices)
      .leftJoin(orders, eq(invoices.orderId, orders.id))
      .leftJoin(users, eq(invoices.customerId, users.id))
      .leftJoin(payments, eq(invoices.id, payments.invoiceId))
      .where(eq(invoices.id, id));

    if (results.length === 0) return undefined;

    const invoice = results[0].invoices!;
    const order = results[0].orders!;
    const customer = results[0].users!;
    
    const paymentList = results
      .filter(row => row.payments)
      .map(row => row.payments!);

    return {
      ...invoice,
      order: { ...order, customer, orderItems: [] } as OrderWithItems,
      customer,
      payments: paymentList
    };
  }

  async getInvoiceByOrder(orderId: string): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.orderId, orderId))
      .limit(1);

    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const [{ count: invoiceCount }] = await db
      .select({ count: count() })
      .from(invoices)
      .where(like(invoices.invoiceNumber, `INV-${year}-${month}-%`));

    const nextNumber = (invoiceCount || 0) + 1;
    return `INV-${year}-${month}-${String(nextNumber).padStart(3, '0')}`;
  }

  async calculateLateFees(invoiceId: string): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice || invoice.status === 'paid') return;

    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    
    if (now > dueDate) {
      const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const lateFeeAmount = Math.min(daysLate * 10, Number(invoice.totalAmount) * 0.1);
      
      await this.updateInvoice(invoiceId, {
        lateFee: lateFeeAmount.toString(),
        status: 'overdue'
      });
    }
  }

  // Deposit operations - Full implementations
  async getDeposits(customerId?: string): Promise<DepositWithDetails[]> {
    const query = db
      .select()
      .from(deposits)
      .leftJoin(orders, eq(deposits.orderId, orders.id))
      .leftJoin(users, eq(deposits.customerId, users.id))
      .leftJoin(payments, eq(deposits.id, payments.depositId))
      .orderBy(desc(deposits.createdAt));

    if (customerId) {
      query.where(eq(deposits.customerId, customerId));
    }

    const results = await query;
    const depositMap = new Map<string, DepositWithDetails>();

    for (const row of results) {
      if (!depositMap.has(row.deposits.id)) {
        depositMap.set(row.deposits.id, {
          ...row.deposits,
          order: row.orders!,
          customer: row.users!,
          payments: []
        });
      }

      if (row.payments) {
        depositMap.get(row.deposits.id)!.payments.push(row.payments);
      }
    }

    return Array.from(depositMap.values());
  }

  async getDeposit(id: string): Promise<DepositWithDetails | undefined> {
    const results = await db
      .select()
      .from(deposits)
      .leftJoin(orders, eq(deposits.orderId, orders.id))
      .leftJoin(users, eq(deposits.customerId, users.id))
      .leftJoin(payments, eq(deposits.id, payments.depositId))
      .where(eq(deposits.id, id));

    if (results.length === 0) return undefined;

    const deposit = results[0].deposits!;
    const order = results[0].orders!;
    const customer = results[0].users!;
    
    const paymentList = results
      .filter(row => row.payments)
      .map(row => row.payments!);

    return {
      ...deposit,
      order,
      customer,
      payments: paymentList
    };
  }

  async getDepositByOrder(orderId: string): Promise<Deposit | undefined> {
    const [deposit] = await db
      .select()
      .from(deposits)
      .where(eq(deposits.orderId, orderId))
      .limit(1);

    return deposit;
  }

  async createDeposit(deposit: InsertDeposit): Promise<Deposit> { 
    const [newDeposit] = await db.insert(deposits).values(deposit).returning();
    return newDeposit;
  }

  async updateDeposit(id: string, deposit: Partial<InsertDeposit>): Promise<Deposit> {
    const [updated] = await db
      .update(deposits)
      .set({ ...deposit, updatedAt: new Date() })
      .where(eq(deposits.id, id))
      .returning();
    return updated;
  }

  async refundDeposit(id: string, refundAmount: number, reason?: string): Promise<Deposit> {
    const [updated] = await db
      .update(deposits)
      .set({
        status: 'refunded',
        refundDate: new Date(),
        refundAmount: refundAmount.toString(),
        notes: reason,
        updatedAt: new Date()
      })
      .where(eq(deposits.id, id))
      .returning();
    return updated;
  }

  async forfeitDeposit(id: string, forfeitAmount: number, reason: string): Promise<Deposit> {
    const [updated] = await db
      .update(deposits)
      .set({
        status: 'forfeited',
        forfeitAmount: forfeitAmount.toString(),
        forfeitReason: reason,
        updatedAt: new Date()
      })
      .where(eq(deposits.id, id))
      .returning();
    return updated;
  }
  
  // Payment operations - Full implementations
  async getPayments(customerId?: string, orderId?: string): Promise<PaymentWithDetails[]> {
    const conditions = [];
    if (customerId) conditions.push(eq(payments.customerId, customerId));
    if (orderId) conditions.push(eq(payments.orderId, orderId));
    
    const baseQuery = db
      .select()
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(deposits, eq(payments.depositId, deposits.id))
      .leftJoin(users, eq(payments.customerId, users.id))
      .orderBy(desc(payments.createdAt));

    const results = conditions.length > 0 
      ? await baseQuery.where(and(...conditions))
      : await baseQuery;
    
    return results.map(row => ({
      ...row.payments,
      order: row.orders || undefined,
      invoice: row.invoices || undefined,
      deposit: row.deposits || undefined,
      customer: row.users!,
    }));
  }

  async getPayment(id: string): Promise<PaymentWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(deposits, eq(payments.depositId, deposits.id))
      .leftJoin(users, eq(payments.customerId, users.id))
      .where(eq(payments.id, id));

    if (!result) return undefined;

    return {
      ...result.payments,
      order: result.orders || undefined,
      invoice: result.invoices || undefined,
      deposit: result.deposits || undefined,
      customer: result.users!,
    };
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updated] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updated;
  }

  async processPayment(id: string, stripePaymentIntentId?: string, stripeChargeId?: string): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set({
        status: 'completed',
        processedAt: new Date(),
        description: stripePaymentIntentId ? `Processed via Stripe: ${stripePaymentIntentId}` : 'Payment processed'
      })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }
  
  // Validity Period operations - Full implementations
  async getValidityPeriods(orderId?: string): Promise<ValidityPeriod[]> {
    if (orderId) {
      return await db.select().from(validityPeriods)
        .where(eq(validityPeriods.orderId, orderId))
        .orderBy(desc(validityPeriods.createdAt));
    }
    
    return await db.select().from(validityPeriods)
      .orderBy(desc(validityPeriods.createdAt));
  }

  async createValidityPeriod(validityPeriod: InsertValidityPeriod): Promise<ValidityPeriod> {
    const [newPeriod] = await db.insert(validityPeriods).values(validityPeriod).returning();
    return newPeriod;
  }

  async updateValidityPeriod(id: string, update: Partial<InsertValidityPeriod>): Promise<ValidityPeriod> {
    const [updated] = await db
      .update(validityPeriods)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(validityPeriods.id, id))
      .returning();
    return updated;
  }

  async extendValidityPeriod(id: string, newEndDate: Date, extensionFee: number): Promise<ValidityPeriod> {
    const [updated] = await db
      .update(validityPeriods)
      .set({
        extensionDate: newEndDate,
        extensionFee: extensionFee.toString(),
        updatedAt: new Date()
      })
      .where(eq(validityPeriods.id, id))
      .returning();
    return updated;
  }
  
  // Late Fee operations - Full implementations
  async getLateFees(customerId?: string, orderId?: string): Promise<LateFee[]> {
    const conditions = [];
    if (customerId) conditions.push(eq(lateFees.customerId, customerId));
    if (orderId) conditions.push(eq(lateFees.orderId, orderId));
    
    if (conditions.length > 0) {
      return await db.select().from(lateFees)
        .where(and(...conditions))
        .orderBy(desc(lateFees.createdAt));
    }
    
    return await db.select().from(lateFees)
      .orderBy(desc(lateFees.createdAt));
  }

  async createLateFee(lateFee: InsertLateFee): Promise<LateFee> {
    const [newLateFee] = await db.insert(lateFees).values(lateFee).returning();
    return newLateFee;
  }

  async updateLateFee(id: string, update: Partial<InsertLateFee>): Promise<LateFee> {
    const [updated] = await db
      .update(lateFees)
      .set(update)
      .where(eq(lateFees.id, id))
      .returning();
    return updated;
  }

  async waiveLateFee(id: string, waivedAmount: number, waivedBy: string, reason: string): Promise<LateFee> {
    const [updated] = await db
      .update(lateFees)
      .set({
        waivedAmount: waivedAmount.toString(),
        waivedBy,
        waivedReason: reason
      })
      .where(eq(lateFees.id, id))
      .returning();
    return updated;
  }

  async payLateFee(id: string): Promise<LateFee> {
    const [updated] = await db
      .update(lateFees)
      .set({
        isPaid: true,
        paidAt: new Date()
      })
      .where(eq(lateFees.id, id))
      .returning();
    return updated;
  }
  
  // Report operations - Full implementations
  async getRevenueReport(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    rentalRevenue: number;
    depositRevenue: number;
    lateFeeRevenue: number;
    refundAmount: number;
    revenueByMonth: Array<{ month: string; revenue: number; }>;
  }> {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get total revenue from payments
    const [totalResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          gte(payments.createdAt, start),
          lte(payments.createdAt, end),
          eq(payments.status, 'completed')
        )
      );

    // Get revenue by payment type
    const revenueByType = await db
      .select({
        type: payments.type,
        amount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          gte(payments.createdAt, start),
          lte(payments.createdAt, end),
          eq(payments.status, 'completed')
        )
      )
      .groupBy(payments.type);

    const typeMap = Object.fromEntries(revenueByType.map(r => [r.type, Number(r.amount)]));

    // Get monthly revenue
    const monthlyRevenue = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${payments.createdAt})`,
        revenue: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          gte(payments.createdAt, start),
          lte(payments.createdAt, end),
          eq(payments.status, 'completed')
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${payments.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${payments.createdAt})`);

    return {
      totalRevenue: Number(totalResult.total),
      rentalRevenue: typeMap.rental || 0,
      depositRevenue: typeMap.deposit || 0,
      lateFeeRevenue: typeMap.late_fee || 0,
      refundAmount: typeMap.refund || 0,
      revenueByMonth: monthlyRevenue.map(r => ({
        month: new Date(r.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        revenue: Number(r.revenue)
      }))
    };
  }

  async getProductReport(): Promise<Array<{
    productId: string;
    productName: string;
    totalRentals: number;
    totalRevenue: number;
    averageRentalDuration: number;
    currentlyRented: number;
  }>> {
    const results = await db
      .select({
        productId: products.id,
        productName: products.name,
        orderId: orders.id,
        orderStatus: orders.status,
        startDate: orders.startDate,
        endDate: orders.endDate,
        totalAmount: orders.totalAmount
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(sql`${orders.id} IS NOT NULL`);

    const productMap = new Map();
    
    for (const row of results) {
      const key = row.productId;
      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: row.productId,
          productName: row.productName,
          totalRentals: 0,
          totalRevenue: 0,
          totalDuration: 0,
          currentlyRented: 0,
          rentals: []
        });
      }
      
      const product = productMap.get(key);
      product.totalRentals++;
      product.totalRevenue += Number(row.totalAmount);
      
      if (row.startDate && row.endDate) {
        const startTime = row.startDate ? new Date(row.startDate).getTime() : 0;
        const endTime = row.endDate ? new Date(row.endDate).getTime() : 0;
        if (startTime && endTime) {
          const duration = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
          product.totalDuration += duration;
        }
      }
      
      if (row.orderStatus && ['picked_up', 'active'].includes(row.orderStatus)) {
        product.currentlyRented++;
      }
    }

    return Array.from(productMap.values()).map(p => ({
      productId: p.productId,
      productName: p.productName,
      totalRentals: p.totalRentals,
      totalRevenue: p.totalRevenue,
      averageRentalDuration: p.totalRentals > 0 ? Math.round(p.totalDuration / p.totalRentals) : 0,
      currentlyRented: p.currentlyRented
    }));
  }

  async getCustomerReport(): Promise<Array<{
    customerId: string;
    customerName: string;
    customerEmail: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: Date | null;
    status: 'active' | 'inactive';
  }>> {
    const results = await db
      .select({
        customerId: users.id,
        customerName: users.name,
        customerEmail: users.email,
        orderId: orders.id,
        orderTotal: orders.totalAmount,
        orderDate: orders.createdAt,
        orderStatus: orders.status
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.customerId))
      .where(eq(users.role, 'customer'));

    const customerMap = new Map();
    
    for (const row of results) {
      const key = row.customerId;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          customerId: row.customerId,
          customerName: row.customerName,
          customerEmail: row.customerEmail,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          orders: []
        });
      }
      
      const customer = customerMap.get(key);
      if (row.orderId) {
        customer.totalOrders++;
        customer.totalSpent += Number(row.orderTotal);
        customer.orders.push({
          date: row.orderDate,
          status: row.orderStatus
        });
        
        if (!customer.lastOrderDate || (row.orderDate && new Date(row.orderDate) > customer.lastOrderDate)) {
          customer.lastOrderDate = row.orderDate ? new Date(row.orderDate) : null;
        }
      }
    }

    return Array.from(customerMap.values()).map(c => ({
      customerId: c.customerId,
      customerName: c.customerName,
      customerEmail: c.customerEmail,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      averageOrderValue: c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0,
      lastOrderDate: c.lastOrderDate,
      status: (c.lastOrderDate && (Date.now() - c.lastOrderDate.getTime()) < 90 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive'
    }));
  }
}

export const storage = new DatabaseStorage();
