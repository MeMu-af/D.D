const { PrismaClient } = require("@prisma/client");

// Prevent multiple instances of Prisma Client in development
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
};

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Add error handling for database connection
prisma.$connect()
  .then(() => {
    console.log('Database connection established');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

// Handle process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;