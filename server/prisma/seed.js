const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Seed 100 users with hashed passwords
  const users = [];
  for (let i = 0; i < 100; i++) {
    const user = {
      username: faker.internet.username(), // Updated from userName()
      email: faker.internet.email(),
      password: await bcrypt.hash(faker.internet.password(), 10),
      bio: faker.lorem.sentence(),
      location: faker.location.city(), // Updated from address.city()
      gamePreferences: faker.lorem.words(5),
      experienceLevel: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']), // Updated from random.arrayElement
      rating: faker.number.float({ min: 1, max: 5 }), // Updated from datatype.float
      profilePicture: faker.image.avatar(),
    };
    const createdUser = await prisma.user.create({ data: user });
    users.push(createdUser);
  }

  // Seed 500 reviews, ensuring reviewer and reviewed are different
  for (let i = 0; i < 500; i++) {
    const reviewer = faker.helpers.arrayElement(users); // Updated from random.arrayElement
    const reviewed = faker.helpers.arrayElement(users);
    if (reviewer.id !== reviewed.id) {
      await prisma.review.create({
        data: {
          reviewerId: reviewer.id,
          reviewedId: reviewed.id,
          rating: faker.number.int({ min: 1, max: 5 }), // Updated from datatype.number
          comment: faker.lorem.paragraph(),
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });