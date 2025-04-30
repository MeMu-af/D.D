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
    console.log('Starting seed process...');

    // Try to clear existing data in the correct order to respect foreign key constraints
    console.log('Clearing existing data...');
    try { 
      await prisma.postLike.deleteMany(); 
      console.log('Post likes cleared');
    } catch (e) {
      console.log('Error clearing post likes:', e.message);
    }
    try { 
      await prisma.rating.deleteMany(); 
      console.log('Ratings cleared');
    } catch (e) {
      console.log('Error clearing ratings:', e.message);
    }
    try { 
      await prisma.comment.deleteMany(); 
      console.log('Comments cleared');
    } catch (e) {
      console.log('Error clearing comments:', e.message);
    }
    try { 
      await prisma.message.deleteMany(); 
      console.log('Messages cleared');
    } catch (e) {
      console.log('Error clearing messages:', e.message);
    }
    try { 
      await prisma.post.deleteMany(); 
      console.log('Posts cleared');
    } catch (e) {
      console.log('Error clearing posts:', e.message);
    }
    try { 
      await prisma.user.deleteMany(); 
      console.log('Users cleared');
    } catch (e) {
      console.log('Error clearing users:', e.message);
    }
    console.log('Data cleared successfully');

    // Define a set of states and their major cities for better test data
    const stateCities = {
      'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
      'NY': ['New York', 'Buffalo', 'Albany', 'Rochester'],
      'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
      'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
      'IL': ['Chicago', 'Springfield', 'Peoria', 'Rockford'],
      'PA': ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown'],
      'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
      'GA': ['Atlanta', 'Savannah', 'Augusta', 'Macon'],
      'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham'],
      'MI': ['Detroit', 'Grand Rapids', 'Lansing', 'Ann Arbor']
    };

    // Create test users
    console.log('Creating test users...');
    const users = [];
    let userCount = 0;

    // Create 3 users for each state-city combination
    for (const [state, cities] of Object.entries(stateCities)) {
      for (const city of cities) {
        for (let i = 0; i < 3; i++) {
          const hashedPassword = await bcrypt.hash('password123', 10);
          const user = await prisma.user.create({
            data: {
              username: `${faker.internet.username()}_${userCount}`,
              email: faker.internet.email(),
              password: hashedPassword,
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              bio: faker.lorem.sentence(),
              city: city,
              state: state,
              latitude: faker.location.latitude(),
              longitude: faker.location.longitude(),
              age: faker.number.int({ min: 18, max: 80 }),
              experience: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced', 'Veteran']),
              favoriteClasses: faker.helpers.arrayElements([
                'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
                'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
              ], { min: 1, max: 3 }),
              profilePicture: TEST_MEDIA.avatars[userCount % TEST_MEDIA.avatars.length]
            }
          });
          users.push(user);
          userCount++;
        }
      }
    }
    console.log(`Created ${userCount} test users successfully`);

    // Create some messages between users
    console.log('Creating test messages...');
    const allUsers = await prisma.user.findMany();
    for (let i = 0; i < 20; i++) {
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