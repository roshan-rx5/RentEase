#!/usr/bin/env tsx

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { users, categories, products } from "../shared/schema";
import bcrypt from "bcryptjs";

async function initDatabase() {
  console.log("Initializing database...");
  
  try {
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar(50) PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamp NOT NULL
      )
    `);
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire)`);
    
    console.log("Tables created successfully!");

    // Create admin user if doesn't exist
    const adminExists = await db.select().from(users).where(sql`email = 'admin@rentflow.com'`).limit(1);
    
    if (adminExists.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.insert(users).values({
        email: 'admin@rentflow.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      });
      
      console.log("Admin user created! Login: admin@rentflow.com / admin123");
    } else {
      console.log("Admin user already exists");
    }

    // Create sample categories
    const categoryExists = await db.select().from(categories).limit(1);
    if (categoryExists.length === 0) {
      await db.insert(categories).values([
        {
          name: "Construction Equipment",
          description: "Heavy machinery and construction tools"
        },
        {
          name: "Power Tools",
          description: "Electric and battery-powered tools"
        },
        {
          name: "Event Equipment",
          description: "Tables, chairs, tents, and event supplies"
        },
        {
          name: "Outdoor Equipment",
          description: "Camping, hiking, and outdoor activity gear"
        }
      ]);
      
      console.log("Sample categories created!");
    }

    // Create sample products
    const productExists = await db.select().from(products).limit(1);
    if (productExists.length === 0) {
      const categoriesData = await db.select().from(categories);
      
      await db.insert(products).values([
        {
          name: "Concrete Mixer",
          description: "Professional concrete mixer for construction projects",
          categoryId: categoriesData[0]?.id,
          dailyRate: "150.00",
          weeklyRate: "900.00",
          securityDeposit: "500.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Drill Press",
          description: "Heavy-duty drill press for precision drilling",
          categoryId: categoriesData[1]?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          securityDeposit: "200.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        {
          name: "Round Tables (10-seat)",
          description: "Professional round tables for events",
          categoryId: categoriesData[2]?.id,
          dailyRate: "25.00",
          weeklyRate: "120.00",
          securityDeposit: "100.00",
          totalQuantity: 15,
          availableQuantity: 15
        },
        {
          name: "Camping Tents",
          description: "4-person waterproof camping tents",
          categoryId: categoriesData[3]?.id,
          dailyRate: "30.00",
          weeklyRate: "180.00",
          securityDeposit: "150.00",
          totalQuantity: 8,
          availableQuantity: 8
        }
      ]);
      
      console.log("Sample products created!");
    }

    console.log("Database initialization completed!");
    
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { initDatabase };