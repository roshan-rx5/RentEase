import { db } from "./db";
import { storage } from "./storage";
import { orders, invoices } from "@shared/schema";

async function seedInvoices() {
  try {
    console.log("Starting invoice seeding...");

    // Get all orders that don't have invoices yet
    const allOrders = await storage.getOrders();
    console.log(`Found ${allOrders.length} total orders`);

    let invoicesCreated = 0;

    for (const order of allOrders) {
      // Check if invoice already exists
      const existingInvoice = await storage.getInvoiceByOrder(order.id);
      if (existingInvoice) {
        console.log(`Invoice already exists for order ${order.orderNumber}`);
        continue;
      }

      // Create invoice for this order
      const invoiceNumber = await storage.generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      const invoice = await storage.createInvoice({
        invoiceNumber,
        orderId: order.id,
        customerId: order.customerId,
        dueDate,
        subtotal: order.totalAmount,
        taxAmount: '0',
        totalAmount: order.totalAmount,
        paidAmount: order.paymentStatus === 'paid' ? order.totalAmount : '0',
        status: order.paymentStatus === 'paid' ? 'paid' : 'sent'
      });

      console.log(`Created invoice ${invoice.invoiceNumber} for order ${order.orderNumber}`);
      invoicesCreated++;
    }

    console.log(`Successfully created ${invoicesCreated} invoices`);
  } catch (error) {
    console.error("Error seeding invoices:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedInvoices();
}

export { seedInvoices };