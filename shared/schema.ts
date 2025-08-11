import { sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'customer']);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'quoted',
  'confirmed', 
  'paid',
  'picked_up',
  'active',
  'returned',
  'completed',
  'cancelled'
]);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'partial',
  'failed',
  'refunded'
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  address: text("address"),
  role: userRoleEnum("role").default('customer').notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Product categories
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rental products
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id),
  imageUrl: varchar("image_url"),
  isRentable: boolean("is_rentable").default(true),
  totalQuantity: integer("total_quantity").default(1),
  availableQuantity: integer("available_quantity").default(1),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  weeklyRate: decimal("weekly_rate", { precision: 10, scale: 2 }),
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rental orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").default('draft').notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  notes: text("notes"),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  pickupAddress: text("pickup_address"),
  returnAddress: text("return_address"),
  actualPickupDate: timestamp("actual_pickup_date"),
  actualReturnDate: timestamp("actual_return_date"),
  lateReturnFee: decimal("late_return_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items (products in each order)
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitRate: decimal("unit_rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default('0'),
  status: varchar("status", { length: 20 }).default('draft'), // draft, sent, paid, overdue, cancelled
  lateFee: decimal("late_fee", { precision: 10, scale: 2 }).default('0'),
  penalties: decimal("penalties", { precision: 10, scale: 2 }).default('0'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security deposits tracking
export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default('pending'), // pending, held, refunded, forfeited
  heldDate: timestamp("held_date"),
  refundDate: timestamp("refund_date"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default('0'),
  forfeitAmount: decimal("forfeit_amount", { precision: 10, scale: 2 }).default('0'),
  forfeitReason: text("forfeit_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  depositId: uuid("deposit_id").references(() => deposits.id),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // rental, deposit, late_fee, penalty, refund
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, bank_transfer, online
  status: varchar("status", { length: 20 }).default('pending'), // pending, completed, failed, refunded
  description: text("description"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validity periods for rentals
export const validityPeriods = pgTable("validity_periods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  gracePeriodHours: integer("grace_period_hours").default(24), // Grace period before late fees
  isActive: boolean("is_active").default(true),
  extensionDate: timestamp("extension_date"), // If period is extended
  extensionFee: decimal("extension_fee", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Late fees and penalties tracking
export const lateFees = pgTable("late_fees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // late_return, damaged_equipment, lost_equipment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  daysLate: integer("days_late").default(0),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  description: text("description"),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  waivedAmount: decimal("waived_amount", { precision: 10, scale: 2 }).default('0'),
  waivedBy: varchar("waived_by").references(() => users.id),
  waivedReason: text("waived_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default('info'), // info, warning, error, success
  isRead: boolean("is_read").default(false),
  relatedOrderId: uuid("related_order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  notifications: many(notifications),

}));



export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  notifications: many(notifications),
  invoices: many(invoices),
  deposits: many(deposits),
  payments: many(payments),
  validityPeriods: many(validityPeriods),
  lateFees: many(lateFees),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [invoices.customerId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const depositsRelations = relations(deposits, ({ one, many }) => ({
  order: one(orders, {
    fields: [deposits.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [deposits.customerId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  deposit: one(deposits, {
    fields: [payments.depositId],
    references: [deposits.id],
  }),
  customer: one(users, {
    fields: [payments.customerId],
    references: [users.id],
  }),
}));

export const validityPeriodsRelations = relations(validityPeriods, ({ one }) => ({
  order: one(orders, {
    fields: [validityPeriods.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [validityPeriods.productId],
    references: [products.id],
  }),
}));

export const lateFeesRelations = relations(lateFees, ({ one }) => ({
  order: one(orders, {
    fields: [lateFees.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [lateFees.customerId],
    references: [users.id],
  }),
  waivedByUser: one(users, {
    fields: [lateFees.waivedBy],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedOrder: one(orders, {
    fields: [notifications.relatedOrderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = insertUserSchema.omit({
  role: true,
}).extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});



export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertValidityPeriodSchema = createInsertSchema(validityPeriods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLateFeeSchema = createInsertSchema(lateFees).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type ValidityPeriod = typeof validityPeriods.$inferSelect;
export type InsertValidityPeriod = z.infer<typeof insertValidityPeriodSchema>;
export type LateFee = typeof lateFees.$inferSelect;
export type InsertLateFee = z.infer<typeof insertLateFeeSchema>;


// Extended types with relations
export type OrderWithItems = Order & {
  orderItems: (OrderItem & { product: Product })[];
  customer: User;
  invoices?: Invoice[];
  deposits?: Deposit[];
  payments?: Payment[];
  validityPeriods?: ValidityPeriod[];
  lateFees?: LateFee[];
};

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type InvoiceWithDetails = Invoice & {
  order: OrderWithItems;
  customer: User;
  payments: Payment[];
};

export type DepositWithDetails = Deposit & {
  order: Order;
  customer: User;
  payments: Payment[];
};

export type PaymentWithDetails = Payment & {
  order?: Order;
  invoice?: Invoice;
  deposit?: Deposit;
  customer: User;
};
