const request = require('supertest');
const app = require('../server');
const { prisma } = require('./setup');
const { faker } = require('@faker-js/faker');

describe('User Tests', () => {
  let testUser;
  let authToken;

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

  test('should get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('should get user by id', async () => {
    // First get all users to get an ID
    const usersResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    const userId = usersResponse.body[0].id;

    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
  });

  test('should update user', async () => {
    const usersResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    const userId = usersResponse.body[0].id;
    const newUsername = faker.internet.userName();

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: newUsername
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe(newUsername);
  });

  test('should get nearby users', async () => {
    const response = await request(app)
      .get('/api/users/nearby')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10
      });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
}); 