const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// URLs for test media files
const TEST_MEDIA = {
  images: [
    'https://picsum.photos/800/600',
    'https://picsum.photos/800/600',
    'https://picsum.photos/800/600'
  ],
  videos: [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ],
  avatars: [
    'https://i.pravatar.cc/300',
    'https://i.pravatar.cc/300',
    'https://i.pravatar.cc/300'
  ]
};

async function downloadFile(url, filePath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function setupMediaFiles() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const videosDir = path.join(uploadsDir, 'videos');

  // Create directories if they don't exist
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir);

  // Download and store media files
  const mediaFiles = {
    images: [],
    videos: [],
    avatars: []
  };

  // Download images
  for (let i = 0; i < TEST_MEDIA.images.length; i++) {
    const fileName = `post-image-${i}.jpg`;
    const filePath = path.join(imagesDir, fileName);
    await downloadFile(TEST_MEDIA.images[i], filePath);
    mediaFiles.images.push(`/uploads/images/${fileName}`);
  }

  // Download videos
  for (let i = 0; i < TEST_MEDIA.videos.length; i++) {
    const fileName = `post-video-${i}.mp4`;
    const filePath = path.join(videosDir, fileName);
    await downloadFile(TEST_MEDIA.videos[i], filePath);
    mediaFiles.videos.push(`/uploads/videos/${fileName}`);
  }

  // Download avatars
  for (let i = 0; i < TEST_MEDIA.avatars.length; i++) {
    const fileName = `avatar-${i}.jpg`;
    const filePath = path.join(imagesDir, fileName);
    await downloadFile(TEST_MEDIA.avatars[i], filePath);
    mediaFiles.avatars.push(`/uploads/images/${fileName}`);
  }

  return mediaFiles;
}

async function main() {
  try {
    // Setup media files
    console.log('Setting up media files...');
    const mediaFiles = await setupMediaFiles();
    console.log('Media files setup complete');

    // Try to clear existing data in the correct order to respect foreign key constraints
    console.log('Clearing existing data...');
    try { await prisma.postLike.deleteMany(); } catch (e) {}
    try { await prisma.rating.deleteMany(); } catch (e) {}
    try { await prisma.comment.deleteMany(); } catch (e) {}
    try { await prisma.message.deleteMany(); } catch (e) {}
    try { await prisma.post.deleteMany(); } catch (e) {}
    try { await prisma.user.deleteMany(); } catch (e) {}
    console.log('Data cleared successfully');

    // Create test users
    console.log('Creating test users...');
    const users = [];
    for (let i = 0; i < 5; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: hashedPassword,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          bio: faker.lorem.sentence(),
          city: faker.location.city(),
          state: faker.helpers.arrayElement(['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
          age: faker.number.int({ min: 18, max: 80 }),
          experience: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced', 'Veteran']),
          favoriteClasses: faker.helpers.arrayElements([
            'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
            'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
          ], { min: 1, max: 3 }),
          profilePicture: mediaFiles.avatars[i % mediaFiles.avatars.length]
        }
      });
      users.push(user);
    }
    console.log('Test users and posts created successfully');

    // Create some messages between users
    console.log('Creating test messages...');
    const allUsers = await prisma.user.findMany();
    for (let i = 0; i < 5; i++) {
      const sender = faker.helpers.arrayElement(allUsers);
      const receiver = faker.helpers.arrayElement(allUsers.filter(u => u.id !== sender.id));
      
      await prisma.message.create({
        data: {
          content: faker.lorem.sentence(),
          senderId: sender.id,
          receiverId: receiver.id,
        },
      });
    }
    console.log('Test messages created successfully');

    console.log('Seeding completed successfully!');
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