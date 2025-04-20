const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.review.deleteMany();
  await prisma.post.deleteMany();
  await prisma.comment.deleteMany();

  // Seed 100 users
  const users = [];
  for (let i = 0; i < 100; i++) {
    const user = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: await bcrypt.hash(faker.internet.password(), 10),
      bio: faker.lorem.sentence(),
      location: faker.location.city(),
      gamePreferences: faker.lorem.words(5),
      experienceLevel: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
      profilePicture: faker.image.avatar(),
    };
    const createdUser = await prisma.user.create({ data: user });
    users.push(createdUser);
  }

  // Seed 500 reviews
  for (let i = 0; i < 500; i++) {
    const reviewer = faker.helpers.arrayElement(users);
    const reviewed = faker.helpers.arrayElement(users);
    if (reviewer.id !== reviewed.id) {
      await prisma.review.create({
        data: {
          reviewerId: reviewer.id,
          reviewedId: reviewed.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.paragraph(),
        },
      });
    }
  }

  // Seed 50 posts
  for (let i = 0; i < 50; i++) {
    const author = faker.helpers.arrayElement(users);
    await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        authorId: author.id,
      },
    });
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