// Script to create an admin user directly in the database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Admin user details - change these as needed
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed
      isAdmin: true
    };
    
    console.log(`Creating admin user with email: ${adminUser.email}`);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email }
    });
    
    if (existingUser) {
      console.log('User already exists. Updating to admin...');
      
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email: adminUser.email },
        data: { isAdmin: true }
      });
      
      console.log('User updated to admin successfully:', updatedUser.id);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        isAdmin: true
      }
    });
    
    console.log('Admin user created successfully:', user.id);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();
