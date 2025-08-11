import {
  users,
  categories,
  products,
  orders,
  orderItems,
  notifications,
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
  type OrderWithItems,
  type ProductWithCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, like, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
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
  
  // Utility operations
  generateOrderNumber(): Promise<string>;
  updateUserStripeInfo(userId: string, stripeInfo: { customerId?: string; subscriptionId?: string }): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async updateUserStripeInfo(userId: string, stripeInfo: { customerId?: string; subscriptionId?: string }): Promise<User> {
    const updateData: Partial<UpsertUser> = {};
    if (stripeInfo.customerId) updateData.stripeCustomerId = stripeInfo.customerId;
    if (stripeInfo.subscriptionId) updateData.stripeSubscriptionId = stripeInfo.subscriptionId;

    const [updated] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
