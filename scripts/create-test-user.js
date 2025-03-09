// This script creates a test user
// Usage: node scripts/create-test-user.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create a regular user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        isAdmin: false
      }
    });
    
    console.log(`Created regular user: ${user.email}`);
    
    // Create an admin user
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminHashedPassword,
        isAdmin: true
      }
    });
    
    console.log(`Created admin user: ${admin.email}`);
    
    // Create some test shipments for the regular user
    const shipment1 = await prisma.shipment.create({
      data: {
        userId: user.id,
        trackingNumber: 'USER1234567',
        origin: 'New York, NY',
        destination: 'Los Angeles, CA',
        currentLocation: 'Chicago, IL',
        shipmentStatus: 'In Transit',
        events: {
          create: [
            {
              status: 'In Transit',
              description: 'Package in transit to next facility',
              location: 'Chicago, IL'
            }
          ]
        }
      }
    });
    
    console.log(`Created shipment for user: ${shipment1.trackingNumber}`);
    
    // Create some test shipments for the admin user
    const shipment2 = await prisma.shipment.create({
      data: {
        userId: admin.id,
        trackingNumber: 'ADMIN7654321',
        origin: 'Seattle, WA',
        destination: 'Miami, FL',
        currentLocation: 'Denver, CO',
        shipmentStatus: 'In Transit',
        events: {
          create: [
            {
              status: 'In Transit',
              description: 'Package in transit to next facility',
              location: 'Denver, CO'
            }
          ]
        }
      }
    });
    
    console.log(`Created shipment for admin: ${shipment2.trackingNumber}`);
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
