const request = require('supertest');
const app = require('../server');
const { prisma } = require('./setup');
const { faker } = require('@faker-js/faker');
const path = require('path');
const fs = require('fs');

describe('Post Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create a test user and get auth token
    testUser = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'Test123!'
    };

    // Register user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    authToken = loginResponse.body.token;
  });

  test('should create a post with media', async () => {
    // Create a temporary test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, 'fake image data');

    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('media', testImagePath)
      .field('caption', 'Test post caption');

    // Clean up test file
    fs.unlinkSync(testImagePath);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('caption');
    expect(response.body).toHaveProperty('mediaUrl');
  });

  test('should not create post without media', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        caption: 'Test post without media'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('should not create post without authentication', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        caption: 'Test post'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
}); 