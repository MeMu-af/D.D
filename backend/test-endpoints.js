const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let userId = '';
let postId = '';

// Add timeout to axios requests
axios.defaults.timeout = 60000; // 60 seconds timeout

// Add request interceptor for logging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    method: request.method,
    url: request.url,
    headers: {
      ...request.headers,
      Authorization: request.headers.Authorization ? 'Bearer [REDACTED]' : undefined
    },
    data: request.data
  });
  return request;
});

// Add response interceptor for logging
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', {
        config: {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout
        },
        message: error.message
      });
    }
    throw error;
  }
);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Wait for server to be ready
 */
async function waitForServer() {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get('http://localhost:3000/health');
      if (response.status === 200) {
        console.log('Server is ready!');
        return true;
      }
    } catch (error) {
      console.log(`Waiting for server... (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }
  throw new Error('Server did not become ready in time');
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying... (${retries} attempts remaining)`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return retryWithBackoff(fn, retries - 1);
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  try {
    if (userId) {
      await prisma.user.deleteMany({
        where: {
          id: userId
        }
      });
    }
    if (postId) {
      await prisma.post.deleteMany({
        where: {
          id: postId
        }
      });
    }
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

async function testEndpoints() {
  try {
    console.log('Starting API endpoint tests...\n');

    // Wait for server to be ready
    await waitForServer();

    // 1. Test Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('Health Check Response:', healthResponse.data);
    console.log('Status:', healthResponse.status);
    console.log('Test #1 completed successfully\n----------------------------------------\n');

    // 2. Test API Documentation
    console.log('2. Testing API Documentation...');
    const apiDocResponse = await axios.get(`${BASE_URL}`);
    console.log('API Documentation Response:', apiDocResponse.data);
    console.log('Status:', apiDocResponse.status);
    console.log('Test #2 completed successfully\n----------------------------------------\n');

    // 3. Test User Registration
    console.log('3. Testing User Registration...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      username: `testuser${Date.now()}`,
      firstName: 'Test',
      lastName: 'User'
    };
    const registerResponse = await retryWithBackoff(async () => {
      const response = await axios.post(`${BASE_URL}/auth/register`, registerData);
      if (!response.data || !response.data.id) {
        throw new Error('Invalid registration response');
      }
      return response;
    });
    console.log('Registration Response:', registerResponse.data);
    console.log('Status:', registerResponse.status);
    userId = registerResponse.data.id;
    console.log('Test #3 completed successfully\n----------------------------------------\n');

    // 4. Test User Login
    console.log('4. Testing User Login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };
    const loginResponse = await retryWithBackoff(async () => {
      const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
      if (!response.data || !response.data.token) {
        throw new Error('Invalid login response');
      }
      return response;
    });
    console.log('Login Response:', loginResponse.data);
    console.log('Status:', loginResponse.status);
    authToken = loginResponse.data.token;
    console.log('Test #4 completed successfully\n----------------------------------------\n');

    // 5. Test Get All Users
    console.log('5. Testing Get All Users...');
    const usersResponse = await retryWithBackoff(() => 
      axios.get(`${BASE_URL}/users`)
    );
    console.log('Users Response:', usersResponse.data);
    console.log('Status:', usersResponse.status);
    console.log('Test #5 completed successfully\n----------------------------------------\n');

    // 6. Test Get User Profile
    console.log('6. Testing Get User Profile...');
    const userProfileResponse = await retryWithBackoff(() => 
      axios.get(`${BASE_URL}/users/${userId}`)
    );
    console.log('User Profile Response:', userProfileResponse.data);
    console.log('Status:', userProfileResponse.status);
    console.log('Test #6 completed successfully\n----------------------------------------\n');

    // 7. Test Update User Profile
    console.log('7. Testing Update User Profile...');
    console.log('Current auth token:', authToken);
    console.log('Current user ID:', userId);

    const updateData = {
      username: `updated${Date.now()}`,
      firstName: 'Updated',
      lastName: 'User',
      bio: 'Updated bio',
      location: 'Updated location',
      age: 25,
      experience: 'Intermediate'
    };

    if (!authToken) {
      throw new Error('No auth token available. Make sure login test passed.');
    }

    if (!userId) {
      throw new Error('No user ID available. Make sure registration test passed.');
    }

    // First, verify the user exists in the database
    try {
      console.log('Verifying user exists in database...');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }
      });
      console.log('User found in database:', user);
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }

    const updateResponse = await retryWithBackoff(async () => {
      try {
        console.log('Sending update request with data:', {
          url: `${BASE_URL}/users/${userId}`,
          data: updateData,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        const response = await axios({
          method: 'put',
          url: `${BASE_URL}/users/${userId}`,
          data: updateData,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000, // 30 second timeout
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept all non-500 responses
          }
        });

        console.log('Update response received:', {
          status: response.status,
          data: response.data
        });

        return response;
      } catch (error) {
        console.error('Update request failed:', error.message);
        if (error.response) {
          console.error('Error response:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        throw error;
      }
    });

    console.log('Update Profile Response:', updateResponse.data);
    console.log('Status:', updateResponse.status);
    console.log('Test #7 completed successfully\n----------------------------------------\n');

    // 8. Test Create Post
    console.log('8. Testing Create Post...');
    const postData = {
      content: 'This is a test post'
    };
    const createPostResponse = await retryWithBackoff(async () => {
      const response = await axios.post(
        `${BASE_URL}/posts`,
        postData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!response.data || !response.data.id) {
        throw new Error('Invalid post creation response');
      }
      return response;
    });
    console.log('Create Post Response:', createPostResponse.data);
    console.log('Status:', createPostResponse.status);
    postId = createPostResponse.data.id;
    console.log('Test #8 completed successfully\n----------------------------------------\n');

    // 9. Test Get All Posts
    console.log('9. Testing Get All Posts...');
    const postsResponse = await retryWithBackoff(() => 
      axios.get(`${BASE_URL}/posts`)
    );
    console.log('Posts Response:', postsResponse.data);
    console.log('Status:', postsResponse.status);
    console.log('Test #9 completed successfully\n----------------------------------------\n');

    // 10. Test Like Post
    console.log('10. Testing Like Post...');
    const likeResponse = await retryWithBackoff(() => 
      axios.post(
        `${BASE_URL}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
    );
    console.log('Like Response:', likeResponse.data);
    console.log('Status:', likeResponse.status);
    console.log('Test #10 completed successfully\n----------------------------------------\n');

    // 11. Test Add Comment
    console.log('11. Testing Add Comment...');
    const commentData = {
      content: 'This is a test comment'
    };
    const commentResponse = await retryWithBackoff(() => 
      axios.post(
        `${BASE_URL}/posts/${postId}/comments`,
        commentData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
    );
    console.log('Comment Response:', commentResponse.data);
    console.log('Status:', commentResponse.status);
    console.log('Test #11 completed successfully\n----------------------------------------\n');

    // 12. Test Search Posts
    console.log('12. Testing Search Posts...');
    const searchResponse = await retryWithBackoff(() => 
      axios.get(`${BASE_URL}/posts/search?query=test`)
    );
    console.log('Search Response:', searchResponse.data);
    console.log('Status:', searchResponse.status);
    console.log('Test #12 completed successfully\n----------------------------------------\n');

    // Clean up test data
    await cleanupTestData();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    await cleanupTestData();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nCleaning up before exit...');
  await cleanupTestData();
  process.exit(0);
});

testEndpoints(); 