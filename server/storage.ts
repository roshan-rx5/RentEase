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
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  
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
  getRevenueReport(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    rentalRevenue: number;
    depositRevenue: number;
    lateFeeRevenue: number;
    refundAmount: number;
  }>;
  getProductReport(): Promise<Array<{
    productId: string;
    productName: string;
    totalRentals: number;
    totalRevenue: number;
    averageRentalDays: number;
    utilizationRate: number;
  }>>;
  getCustomerReport(): Promise<Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
    outstandingBalance: number;
    lastRentalDate: Date | null;
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
    // Get products that have available quantity or are not booked during the requested period
    const allProducts = await this.getProducts();
    
    // For now, return all products with available quantity > 0
    // TODO: Implement proper availability checking based on order overlaps
    return allProducts.filter(product => product.availableQuantity && product.availableQuantity > 0);
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

  // Stub implementations for all other required methods to fix compilation
  async getDeposits(): Promise<DepositWithDetails[]> { return []; }
  async getDeposit(): Promise<DepositWithDetails | undefined> { return undefined; }
  async getDepositByOrder(): Promise<Deposit | undefined> { return undefined; }
  async createDeposit(deposit: InsertDeposit): Promise<Deposit> { 
    const [newDeposit] = await db.insert(deposits).values(deposit).returning();
    return newDeposit;
  }
  async updateDeposit(id: string, deposit: Partial<InsertDeposit>): Promise<Deposit> {
    const [updated] = await db.update(deposits).set(deposit).where(eq(deposits.id, id)).returning();
    return updated;
  }
  async refundDeposit(): Promise<Deposit> { return {} as Deposit; }
  async forfeitDeposit(): Promise<Deposit> { return {} as Deposit; }
  
  async getPayments(): Promise<PaymentWithDetails[]> { return []; }
  async getPayment(): Promise<PaymentWithDetails | undefined> { return undefined; }
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updated] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updated;
  }
  async processPayment(): Promise<Payment> { return {} as Payment; }
  
  async getValidityPeriods(): Promise<ValidityPeriod[]> { return []; }
  async createValidityPeriod(validityPeriod: InsertValidityPeriod): Promise<ValidityPeriod> {
    const [newPeriod] = await db.insert(validityPeriods).values(validityPeriod).returning();
    return newPeriod;
  }
  async updateValidityPeriod(): Promise<ValidityPeriod> { return {} as ValidityPeriod; }
  async extendValidityPeriod(): Promise<ValidityPeriod> { return {} as ValidityPeriod; }
  
  async getLateFees(): Promise<LateFee[]> { return []; }
  async createLateFee(lateFee: InsertLateFee): Promise<LateFee> {
    const [newLateFee] = await db.insert(lateFees).values(lateFee).returning();
    return newLateFee;
  }
  async updateLateFee(): Promise<LateFee> { return {} as LateFee; }
  async waiveLateFee(): Promise<LateFee> { return {} as LateFee; }
  async payLateFee(): Promise<LateFee> { return {} as LateFee; }
  
  async getRevenueReport(): Promise<any> { return {}; }
  async getProductReport(): Promise<any[]> { return []; }
  async getCustomerReport(): Promise<any[]> { return []; }
}

export const storage = new DatabaseStorage();
