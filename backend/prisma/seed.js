const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Try to clear existing data in the correct order to respect foreign key constraints
    try { await prisma.postLike.deleteMany(); } catch (e) {}
    try { await prisma.rating.deleteMany(); } catch (e) {}
    try { await prisma.comment.deleteMany(); } catch (e) {}
    try { await prisma.message.deleteMany(); } catch (e) {}
    try { await prisma.post.deleteMany(); } catch (e) {}
    try { await prisma.user.deleteMany(); } catch (e) {}

    // Create 10 test users
    for (let i = 0; i < 10; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          username: faker.internet.username(),
          password: hashedPassword,
          bio: faker.lorem.sentence(),
          location: faker.location.city(),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
          lastLocationUpdate: faker.date.recent(),
          age: faker.number.int({ min: 18, max: 60 }),
          experience: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Expert']),
          profilePicture: faker.helpers.arrayElement([
            null,
            '/uploads/images/default-avatar.jpg'
          ]),
        },
      });

      // Create some posts for each user
      for (let j = 0; j < 2; j++) {
        const post = await prisma.post.create({
          data: {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            media: faker.helpers.arrayElement([
              null,
              '/uploads/images/post-image.jpg',
              '/uploads/videos/post-video.mp4'
            ]),
            userId: user.id,
          },
        });

        // Create some ratings for each post
        await prisma.rating.create({
          data: {
            score: faker.number.int({ min: 1, max: 5 }),
            userId: user.id,
            postId: post.id,
          },
        });

        // Create some comments for each post
        await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            userId: user.id,
            postId: post.id,
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
  } catch (error) {
    console.error('Error in seed script:', error);
    throw error;
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