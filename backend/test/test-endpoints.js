const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let userId = '';
let postId = '';
let serverProcess = null;

// Configuration
const config = {
  timeout: 5000, // Reduced to 5 seconds
  maxRetries: 1,  // Reduced to 1 retry
  retryDelay: 1000, // Reduced to 1 second
  serverWaitAttempts: 3, // Reduced to 3 attempts
  serverWaitDelay: 500 // Reduced to 0.5 seconds
};

// Configure axios
axios.defaults.timeout = config.timeout;

// Request interceptor for logging
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

// Response interceptor for logging
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

// Start the server
async function startServer() {
  console.log('Using existing server on port 3000...');
  await waitForServer();
}

// Stop the server
async function stopServer() {
  console.log('Skipping server stop as we are using an existing server');
}

/**
 * Wait for server to be ready
 */
async function waitForServer() {
  console.log('Waiting for server to be ready...');
  let attempts = 0;
  
  while (attempts < config.serverWaitAttempts) {
    try {
      const response = await axios.get('http://localhost:3000/health');
      if (response.status === 200) {
        console.log('Server is ready!');
        return;
      }
    } catch (error) {
      console.log(`Server not ready yet (attempt ${attempts + 1}/${config.serverWaitAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, config.serverWaitDelay));
      attempts++;
    }
  }
  
  throw new Error('Server did not become ready in time');
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, retries = config.maxRetries) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying... (${retries} attempts remaining)`);
    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
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
        where: { id: userId }
      });
    }
    if (postId) {
      await prisma.post.deleteMany({
        where: { id: postId }
      });
    }
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Test helper functions
 */
async function testHealthCheck() {
  console.log('1. Testing Health Check...');
  const response = await axios.get('http://localhost:3000/health');
  if (response.status !== 200) {
    throw new Error('Health check failed');
  }
  console.log('Health Check passed\n');
}

async function testApiDocumentation() {
  console.log('2. Testing API Documentation...');
  const response = await axios.get(`${BASE_URL}`);
  if (response.status !== 200) {
    throw new Error('API documentation endpoint failed');
  }
  console.log('API Documentation test passed\n');
}

async function testUserRegistration() {
  console.log('3. Testing User Registration...');
  const registerData = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    username: `testuser${Date.now()}`,
    firstName: 'Test',
    lastName: 'User'
  };

  const response = await retryWithBackoff(async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, registerData);
    if (!res.data || !res.data.id) {
      throw new Error('Invalid registration response');
    }
    return res;
  });

  userId = response.data.id;
  console.log('User Registration test passed\n');
  return registerData;
}

async function testUserLogin(registerData) {
  console.log('4. Testing User Login...');
  const loginData = {
    email: registerData.email,
    password: registerData.password
  };

  const response = await retryWithBackoff(async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, loginData);
    if (!res.data || !res.data.token) {
      throw new Error('Invalid login response');
    }
    return res;
  });

  authToken = response.data.token;
  console.log('User Login test passed\n');
}

async function testGetAllUsers() {
  console.log('5. Testing Get All Users...');
  const response = await retryWithBackoff(() => 
    axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );
  if (response.status !== 200) {
    throw new Error('Get all users failed');
  }
  console.log('Get All Users test passed\n');
}

async function testGetUserProfile() {
  console.log('6. Testing Get User Profile...');
  const response = await retryWithBackoff(() => 
    axios.get(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );
  if (response.status !== 200 || !response.data.id) {
    throw new Error('Get user profile failed');
  }
  console.log('Get User Profile test passed\n');
}

async function testUpdateUserProfile() {
  console.log('7. Testing Update User Profile...');
  const updateData = {
    username: `updated${Date.now()}`,
    firstName: 'Updated',
    lastName: 'User',
    bio: 'Updated bio',
    location: 'Updated location',
    age: 25,
    experience: 'Intermediate'
  };

  // Update user profile
  const updateResponse = await retryWithBackoff(() => 
    axios.put(`${BASE_URL}/users/${userId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
  );

  if (updateResponse.status !== 200) {
    throw new Error('Update user profile failed');
  }

  // Verify the update
  const verifyResponse = await retryWithBackoff(() => 
    axios.get(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  const updatedUser = verifyResponse.data;
  if (updatedUser.firstName !== updateData.firstName || 
      updatedUser.lastName !== updateData.lastName ||
      updatedUser.bio !== updateData.bio ||
      updatedUser.location !== updateData.location ||
      updatedUser.age !== updateData.age ||
      updatedUser.experience !== updateData.experience) {
    throw new Error('User profile update verification failed');
  }

  console.log('Update User Profile test passed\n');
}

async function testCreatePost() {
  console.log('8. Testing Create Post...');
  const postData = {
    title: 'Test Post Title',
    content: 'Test post content'
  };

  try {
    const response = await retryWithBackoff(() => 
      axios.post(`${BASE_URL}/posts`, postData, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
    );

    if (response.status !== 201 || !response.data.id) {
      throw new Error('Create post failed');
    }

    postId = response.data.id;
    console.log('Create Post test passed\n');
  } catch (error) {
    console.error('Create post error:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreatePostWithImage() {
  console.log('8.1 Testing Create Post with Image...');
  const formData = new FormData();
  formData.append('title', 'Test Post with Image');
  formData.append('content', 'Test post content with image');
  
  // Add the test image file
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  formData.append('media', fs.createReadStream(testImagePath));

  const response = await retryWithBackoff(() => 
    axios.post(`${BASE_URL}/posts`, formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    })
  );

  if (response.status !== 201 || !response.data.id) {
    throw new Error('Create post with image failed');
  }

  console.log('Create Post with Image test passed\n');
}

async function testLikePost() {
  console.log('9. Testing Like Post...');
  const response = await retryWithBackoff(() => 
    axios.post(`${BASE_URL}/posts/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200 || !response.data.likes) {
    throw new Error('Like post failed');
  }
  console.log('Like Post test passed\n');
}

async function testUnlikePost() {
  console.log('10. Testing Unlike Post...');
  const response = await retryWithBackoff(() => 
    axios.delete(`${BASE_URL}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200) {
    throw new Error('Unlike post failed');
  }
  console.log('Unlike Post test passed\n');
}

async function testAddComment() {
  console.log('11. Testing Add Comment...');
  const commentData = {
    content: 'This is a test comment'
  };

  const response = await retryWithBackoff(() => 
    axios.post(`${BASE_URL}/posts/${postId}/comments`, commentData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
  );

  if (response.status !== 201 || !response.data.id) {
    throw new Error('Add comment failed');
  }
  console.log('Add Comment test passed\n');
}

async function testGetPost() {
  console.log('12. Testing Get Post...');
  const response = await retryWithBackoff(() => 
    axios.get(`${BASE_URL}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200 || !response.data.id) {
    throw new Error('Get post failed');
  }
  console.log('Get Post test passed\n');
}

async function testDeletePost() {
  console.log('13. Testing Delete Post...');
  const response = await retryWithBackoff(() => 
    axios.delete(`${BASE_URL}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200) {
    throw new Error('Delete post failed');
  }
  console.log('Delete Post test passed\n');
}

async function testSearchPosts() {
  console.log('15. Testing Search Posts...');
  const response = await retryWithBackoff(() => 
    axios.get(`${BASE_URL}/posts/search?query=test`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200) {
    throw new Error('Search posts failed');
  }
  console.log('Search Posts test passed\n');
}

async function testGetUserPosts() {
  console.log('16. Testing Get User Posts...');
  const response = await retryWithBackoff(() => 
    axios.get(`${BASE_URL}/posts/user/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200) {
    throw new Error('Get user posts failed');
  }
  console.log('Get User Posts test passed\n');
}

async function testUpdatePost() {
  console.log('17. Testing Update Post...');
  const updateData = {
    title: 'Updated Test Post Title',
    content: 'Updated test post content'
  };

  const response = await retryWithBackoff(() => 
    axios.put(`${BASE_URL}/posts/${postId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
  );

  if (response.status !== 200 || response.data.title !== updateData.title) {
    throw new Error('Update post failed');
  }
  console.log('Update Post test passed\n');
}

async function testDeleteComment() {
  console.log('18. Testing Delete Comment...');
  // First create a comment to delete
  const commentData = {
    content: 'Test comment to delete'
  };

  const createResponse = await retryWithBackoff(() => 
    axios.post(`${BASE_URL}/posts/${postId}/comments`, commentData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
  );

  if (createResponse.status !== 201 || !createResponse.data.id) {
    throw new Error('Create comment for deletion failed');
  }

  const commentId = createResponse.data.id;

  // Now delete the comment
  const deleteResponse = await retryWithBackoff(() => 
    axios.delete(`${BASE_URL}/posts/${postId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (deleteResponse.status !== 200) {
    throw new Error('Delete comment failed');
  }
  console.log('Delete Comment test passed\n');
}

async function testEndpoints() {
  try {
    console.log('Starting API endpoint tests...\n');

    // Start the server
    await startServer();

    // Wait for server to be ready
    console.log('Checking if server is ready...');
    await waitForServer();
    console.log('Server is ready, proceeding with tests...\n');

    // Run all tests in sequence with detailed logging
    console.log('1. Starting Health Check test...');
    await testHealthCheck();
    
    console.log('2. Starting API Documentation test...');
    await testApiDocumentation();
    
    console.log('3. Starting User Registration test...');
    const registerData = await testUserRegistration();
    
    console.log('4. Starting User Login test...');
    await testUserLogin(registerData);
    
    console.log('5. Starting Get All Users test...');
    await testGetAllUsers();
    
    console.log('6. Starting Get User Profile test...');
    await testGetUserProfile();
    
    console.log('7. Starting Update User Profile test...');
    await testUpdateUserProfile();
    
    console.log('8. Starting Create Post test...');
    await testCreatePost();
    
    console.log('9. Starting Create Post with Image test...');
    await testCreatePostWithImage();
    
    console.log('10. Starting Like Post test...');
    await testLikePost();
    
    console.log('11. Starting Unlike Post test...');
    await testUnlikePost();
    
    console.log('12. Starting Add Comment test...');
    await testAddComment();
    
    console.log('13. Starting Get Post test...');
    await testGetPost();
    
    console.log('14. Starting Delete Post test...');
    await testDeletePost();

    console.log('15. Starting Search Posts test...');
    await testSearchPosts();

    console.log('16. Starting Get User Posts test...');
    await testGetUserPosts();

    console.log('17. Starting Update Post test...');
    await testUpdatePost();

    console.log('18. Starting Delete Comment test...');
    await testDeleteComment();

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    console.log('Cleaning up test data...');
    await cleanupTestData();
    await stopServer();
  }
}

// Run the tests
console.log('Starting test suite...');
testEndpoints()
  .then(() => {
    console.log('Test suite completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  }); 