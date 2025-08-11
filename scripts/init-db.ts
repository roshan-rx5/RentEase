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
        },
        {
          name: "Photography & Video",
          description: "Professional cameras, lighting, and video equipment"
        },
        {
          name: "Kitchen Appliances",
          description: "Commercial and specialty cooking equipment"
        },
        {
          name: "Sports Equipment",
          description: "Athletic gear and recreational sports equipment"
        },
        {
          name: "Audio & Music",
          description: "Sound systems, instruments, and audio equipment"
        },
        {
          name: "Office Equipment",
          description: "Printers, projectors, and business machinery"
        },
        {
          name: "Gaming & Entertainment",
          description: "Gaming consoles, arcade machines, and party equipment"
        },
        {
          name: "Home Appliances",
          description: "Household appliances and cleaning equipment"
        },
        {
          name: "Transportation",
          description: "Bikes, scooters, and mobility equipment"
        },
        {
          name: "Medical Equipment",
          description: "Healthcare and wellness equipment"
        },
        {
          name: "Educational Equipment",
          description: "Teaching aids and educational technology"
        },
        {
          name: "Automotive Tools",
          description: "Car maintenance and automotive repair equipment"
        },
        {
          name: "Party & Celebration",
          description: "Party decorations, inflatables, and celebration equipment"
        },
        {
          name: "Fitness Equipment",
          description: "Exercise machines and fitness accessories"
        },
        {
          name: "Computer & Tech",
          description: "Laptops, tablets, and technology equipment"
        }
      ]);
      
      console.log("Sample categories created!");
    }

    // Create sample products
    const productExists = await db.select().from(products).limit(1);
    if (productExists.length === 0) {
      const categoriesData = await db.select().from(categories);
      
      const productData = [
        // Construction Equipment
        {
          name: "Concrete Mixer",
          description: "Professional concrete mixer for construction projects",
          categoryId: categoriesData.find(c => c.name === "Construction Equipment")?.id,
          dailyRate: "150.00",
          weeklyRate: "900.00",
          monthlyRate: "3200.00",
          securityDeposit: "500.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Excavator",
          description: "Mini excavator for digging and earthmoving",
          categoryId: categoriesData.find(c => c.name === "Construction Equipment")?.id,
          dailyRate: "350.00",
          weeklyRate: "2100.00",
          monthlyRate: "7500.00",
          securityDeposit: "2000.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Power Tools
        {
          name: "Drill Press",
          description: "Heavy-duty drill press for precision drilling",
          categoryId: categoriesData.find(c => c.name === "Power Tools")?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          monthlyRate: "800.00",
          securityDeposit: "200.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        {
          name: "Circular Saw",
          description: "Professional circular saw with laser guide",
          categoryId: categoriesData.find(c => c.name === "Power Tools")?.id,
          dailyRate: "35.00",
          weeklyRate: "200.00",
          monthlyRate: "650.00",
          securityDeposit: "150.00",
          totalQuantity: 5,
          availableQuantity: 5
        },
        // Event Equipment
        {
          name: "Round Tables (10-seat)",
          description: "Professional round tables for events",
          categoryId: categoriesData.find(c => c.name === "Event Equipment")?.id,
          dailyRate: "25.00",
          weeklyRate: "120.00",
          monthlyRate: "400.00",
          securityDeposit: "100.00",
          totalQuantity: 15,
          availableQuantity: 15
        },
        {
          name: "Wedding Arch",
          description: "Elegant white wedding arch with floral attachments",
          categoryId: categoriesData.find(c => c.name === "Event Equipment")?.id,
          dailyRate: "75.00",
          weeklyRate: "400.00",
          monthlyRate: "1200.00",
          securityDeposit: "300.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        // Outdoor Equipment
        {
          name: "Camping Tents",
          description: "4-person waterproof camping tents",
          categoryId: categoriesData.find(c => c.name === "Outdoor Equipment")?.id,
          dailyRate: "30.00",
          weeklyRate: "180.00",
          monthlyRate: "600.00",
          securityDeposit: "150.00",
          totalQuantity: 8,
          availableQuantity: 8
        },
        {
          name: "Kayaks",
          description: "Single-person recreational kayaks with paddles",
          categoryId: categoriesData.find(c => c.name === "Outdoor Equipment")?.id,
          dailyRate: "50.00",
          weeklyRate: "280.00",
          monthlyRate: "900.00",
          securityDeposit: "200.00",
          totalQuantity: 6,
          availableQuantity: 6
        },
        // Photography & Video
        {
          name: "DSLR Camera Kit",
          description: "Professional DSLR with lenses and accessories",
          categoryId: categoriesData.find(c => c.name === "Photography & Video")?.id,
          dailyRate: "85.00",
          weeklyRate: "500.00",
          monthlyRate: "1800.00",
          securityDeposit: "1200.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        {
          name: "Video Lighting Kit",
          description: "Professional 3-point lighting setup for video production",
          categoryId: categoriesData.find(c => c.name === "Photography & Video")?.id,
          dailyRate: "60.00",
          weeklyRate: "350.00",
          monthlyRate: "1200.00",
          securityDeposit: "400.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        // Kitchen Appliances
        {
          name: "Commercial Stand Mixer",
          description: "Heavy-duty commercial stand mixer for large batches",
          categoryId: categoriesData.find(c => c.name === "Kitchen Appliances")?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          monthlyRate: "800.00",
          securityDeposit: "300.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        {
          name: "Espresso Machine",
          description: "Professional espresso machine with milk steamer",
          categoryId: categoriesData.find(c => c.name === "Kitchen Appliances")?.id,
          dailyRate: "95.00",
          weeklyRate: "550.00",
          monthlyRate: "1900.00",
          securityDeposit: "800.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Sports Equipment
        {
          name: "Basketball Hoop System",
          description: "Portable basketball hoop with adjustable height",
          categoryId: categoriesData.find(c => c.name === "Sports Equipment")?.id,
          dailyRate: "40.00",
          weeklyRate: "220.00",
          monthlyRate: "700.00",
          securityDeposit: "250.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Golf Cart",
          description: "Electric golf cart for 2 passengers",
          categoryId: categoriesData.find(c => c.name === "Sports Equipment")?.id,
          dailyRate: "120.00",
          weeklyRate: "700.00",
          monthlyRate: "2400.00",
          securityDeposit: "600.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Audio & Music
        {
          name: "PA Sound System",
          description: "Complete PA system with speakers and microphones",
          categoryId: categoriesData.find(c => c.name === "Audio & Music")?.id,
          dailyRate: "80.00",
          weeklyRate: "450.00",
          monthlyRate: "1500.00",
          securityDeposit: "500.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        {
          name: "Electric Guitar",
          description: "Fender electric guitar with amplifier",
          categoryId: categoriesData.find(c => c.name === "Audio & Music")?.id,
          dailyRate: "35.00",
          weeklyRate: "200.00",
          monthlyRate: "650.00",
          securityDeposit: "400.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        // Office Equipment
        {
          name: "Laser Projector",
          description: "4K laser projector for presentations and events",
          categoryId: categoriesData.find(c => c.name === "Office Equipment")?.id,
          dailyRate: "75.00",
          weeklyRate: "400.00",
          monthlyRate: "1300.00",
          securityDeposit: "800.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Industrial Printer",
          description: "High-speed color laser printer",
          categoryId: categoriesData.find(c => c.name === "Office Equipment")?.id,
          dailyRate: "55.00",
          weeklyRate: "300.00",
          monthlyRate: "1000.00",
          securityDeposit: "400.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Gaming & Entertainment
        {
          name: "Gaming Console Bundle",
          description: "PlayStation 5 with controllers and popular games",
          categoryId: categoriesData.find(c => c.name === "Gaming & Entertainment")?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          monthlyRate: "800.00",
          securityDeposit: "600.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        {
          name: "Arcade Machine",
          description: "Classic arcade cabinet with multiple games",
          categoryId: categoriesData.find(c => c.name === "Gaming & Entertainment")?.id,
          dailyRate: "100.00",
          weeklyRate: "600.00",
          monthlyRate: "2000.00",
          securityDeposit: "800.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Home Appliances
        {
          name: "Pressure Washer",
          description: "High-pressure washer for cleaning driveways and homes",
          categoryId: categoriesData.find(c => c.name === "Home Appliances")?.id,
          dailyRate: "55.00",
          weeklyRate: "300.00",
          monthlyRate: "950.00",
          securityDeposit: "200.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        {
          name: "Steam Cleaner",
          description: "Professional steam cleaner for carpets and upholstery",
          categoryId: categoriesData.find(c => c.name === "Home Appliances")?.id,
          dailyRate: "40.00",
          weeklyRate: "220.00",
          monthlyRate: "700.00",
          securityDeposit: "150.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        // Transportation
        {
          name: "Electric Bike",
          description: "Electric mountain bike with long-range battery",
          categoryId: categoriesData.find(c => c.name === "Transportation")?.id,
          dailyRate: "65.00",
          weeklyRate: "350.00",
          monthlyRate: "1200.00",
          securityDeposit: "500.00",
          totalQuantity: 6,
          availableQuantity: 6
        },
        {
          name: "Electric Scooter",
          description: "High-speed electric scooter for urban commuting",
          categoryId: categoriesData.find(c => c.name === "Transportation")?.id,
          dailyRate: "35.00",
          weeklyRate: "200.00",
          monthlyRate: "650.00",
          securityDeposit: "300.00",
          totalQuantity: 8,
          availableQuantity: 8
        },
        // Medical Equipment
        {
          name: "Wheelchair",
          description: "Lightweight folding wheelchair",
          categoryId: categoriesData.find(c => c.name === "Medical Equipment")?.id,
          dailyRate: "25.00",
          weeklyRate: "140.00",
          monthlyRate: "450.00",
          securityDeposit: "200.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        {
          name: "Hospital Bed",
          description: "Adjustable hospital bed with side rails",
          categoryId: categoriesData.find(c => c.name === "Medical Equipment")?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          monthlyRate: "800.00",
          securityDeposit: "300.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Educational Equipment
        {
          name: "Interactive Whiteboard",
          description: "Smart interactive whiteboard for classrooms",
          categoryId: categoriesData.find(c => c.name === "Educational Equipment")?.id,
          dailyRate: "60.00",
          weeklyRate: "350.00",
          monthlyRate: "1200.00",
          securityDeposit: "600.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Microscope Set",
          description: "Professional microscopes for science education",
          categoryId: categoriesData.find(c => c.name === "Educational Equipment")?.id,
          dailyRate: "40.00",
          weeklyRate: "220.00",
          monthlyRate: "700.00",
          securityDeposit: "400.00",
          totalQuantity: 5,
          availableQuantity: 5
        },
        // Automotive Tools
        {
          name: "Car Jack & Tools",
          description: "Hydraulic car jack with complete tool set",
          categoryId: categoriesData.find(c => c.name === "Automotive Tools")?.id,
          dailyRate: "30.00",
          weeklyRate: "170.00",
          monthlyRate: "550.00",
          securityDeposit: "150.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        {
          name: "OBD Scanner",
          description: "Professional automotive diagnostic scanner",
          categoryId: categoriesData.find(c => c.name === "Automotive Tools")?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          monthlyRate: "800.00",
          securityDeposit: "300.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Party & Celebration
        {
          name: "Bounce House",
          description: "Large inflatable bounce house for kids parties",
          categoryId: categoriesData.find(c => c.name === "Party & Celebration")?.id,
          dailyRate: "120.00",
          weeklyRate: "700.00",
          monthlyRate: "2400.00",
          securityDeposit: "400.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Photo Booth Props",
          description: "Complete photo booth setup with props and backdrop",
          categoryId: categoriesData.find(c => c.name === "Party & Celebration")?.id,
          dailyRate: "65.00",
          weeklyRate: "350.00",
          monthlyRate: "1200.00",
          securityDeposit: "200.00",
          totalQuantity: 2,
          availableQuantity: 2
        },
        // Fitness Equipment
        {
          name: "Treadmill",
          description: "Commercial-grade treadmill with multiple programs",
          categoryId: categoriesData.find(c => c.name === "Fitness Equipment")?.id,
          dailyRate: "85.00",
          weeklyRate: "500.00",
          monthlyRate: "1700.00",
          securityDeposit: "600.00",
          totalQuantity: 3,
          availableQuantity: 3
        },
        {
          name: "Weight Set",
          description: "Complete weight set with barbell and dumbbells",
          categoryId: categoriesData.find(c => c.name === "Fitness Equipment")?.id,
          dailyRate: "45.00",
          weeklyRate: "250.00",
          monthlyRate: "800.00",
          securityDeposit: "300.00",
          totalQuantity: 4,
          availableQuantity: 4
        },
        // Computer & Tech
        {
          name: "MacBook Pro",
          description: "Latest MacBook Pro for professional work",
          categoryId: categoriesData.find(c => c.name === "Computer & Tech")?.id,
          dailyRate: "95.00",
          weeklyRate: "550.00",
          monthlyRate: "1900.00",
          securityDeposit: "1500.00",
          totalQuantity: 5,
          availableQuantity: 5
        },
        {
          name: "iPad Pro",
          description: "iPad Pro with Apple Pencil for creative work",
          categoryId: categoriesData.find(c => c.name === "Computer & Tech")?.id,
          dailyRate: "55.00",
          weeklyRate: "300.00",
          monthlyRate: "1000.00",
          securityDeposit: "800.00",
          totalQuantity: 6,
          availableQuantity: 6
        }
      ];

      await db.insert(products).values(productData);
      
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