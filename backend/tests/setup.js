const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Clean up database before tests
beforeAll(async () => {
  // Clear all tables
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "Post" CASCADE;`;
});

// Close Prisma connection after tests
afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = {
  prisma
}; 