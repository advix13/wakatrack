const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a test shipment
  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber: 'AWB746456',
      name: 'John Smith',
      email: 'john@example.com',
      origin: '123 Shipping Lane, New York, NY 10001',
      destination: '456 Delivery Road, Los Angeles, CA 90001',
      location: 'Sort facility in New York',
      shippingDate: new Date(),
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      events: {
        create: [
          {
            status: 'In Transit',
            description: 'Package is being sorted',
            location: 'Sort facility in New York',
            timestamp: new Date()
          },
          {
            status: 'Picked Up',
            description: 'Package has been picked up by courier',
            location: 'Brooklyn Warehouse',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          }
        ]
      }
    }
  });

  console.log('Database has been seeded with test data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
