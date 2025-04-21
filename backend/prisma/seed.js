const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.review.deleteMany();
  await prisma.post.deleteMany();
  await prisma.comment.deleteMany();

  // Create 10 test users
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        location: faker.location.city(),
        age: faker.number.int({ min: 18, max: 60 }),
        experience: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Expert']),
      },
    });

    // Create some ratings for each user
    for (let j = 0; j < 3; j++) {
      await prisma.rating.create({
        data: {
          score: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
          userId: user.id,
        },
      });
    }

    // Create some comments for each user
    for (let j = 0; j < 2; j++) {
      await prisma.comment.create({
        data: {
          content: faker.lorem.paragraph(),
          userId: user.id,
        },
      });
    }
  }

  // Create some messages between users
  const users = await prisma.user.findMany();
  for (let i = 0; i < 5; i++) {
    const sender = faker.helpers.arrayElement(users);
    const receiver = faker.helpers.arrayElement(users.filter(u => u.id !== sender.id));
    
    await prisma.message.create({
      data: {
        content: faker.lorem.sentence(),
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });