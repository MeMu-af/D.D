const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { spawn } = require('child_process');
const { cleanupTestImages } = require('./image-cleanup');
const assert = require('assert');
const express = require('express');
const router = express.Router();

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let userId = '';
let postId = '';
let serverProcess = null;

// Configuration
const config = {
  timeout: 10000,      // Reduced to 10 seconds
  maxRetries: 2,       // Reduced to 2 retries
  retryDelay: 1000,    // Reduced to 1 second
  serverWaitAttempts: 3, // Reduced to 3 attempts
  serverWaitDelay: 500  // Reduced to 0.5 seconds
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
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', {
        config: {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
          headers: error.config.headers
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
    console.log('Starting test data cleanup...');
    
    // Delete posts first to avoid foreign key constraints
    await prisma.post.deleteMany({
      where: {
        userId: userId
      }
    });

    // Then delete the user
    if (userId) {
      await prisma.user.deleteMany({
        where: { id: userId }
      });
    }

    // Clean up test images
    console.log('Starting image cleanup...');
    const imageCleanupResult = await cleanupTestImages();
    console.log('Image cleanup result:', imageCleanupResult);

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
  const timestamp = Date.now();
  const registerData = {
    email: `test${timestamp}@example.com`,
    password: 'Test123!',
    username: `testuser${timestamp}`,
    location: 'Test City',
    experience: 'Intermediate',
    bio: 'Test bio for automated testing'
  };

  const response = await retryWithBackoff(async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, registerData);
    if (!res.data || !res.data.user || !res.data.token) {
      throw new Error('Invalid registration response');
    }
    return res;
  });

  userId = response.data.user.id;
  authToken = response.data.token;
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
  const response = await retryWithBackoff(async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    if (!res.data || !res.data.id) {
      throw new Error('Invalid profile response');
    }
    return res;
  });

  console.log('Get User Profile test passed\n');
}

async function testUpdateUserProfile() {
  console.log('\nTesting update user profile...');
  try {
    const updateData = {
      location: 'New York',
      experience: 'Advanced',
      favoriteClasses: ['Wizard', 'Rogue'],
      bio: 'Updated bio for testing'
    };

    const response = await axios.put(
      `${BASE_URL}/auth/profile`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    console.log('Update profile response:', response.data);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.location, updateData.location);
    assert.strictEqual(response.data.experience, updateData.experience);
    assert.deepStrictEqual(response.data.favoriteClasses, updateData.favoriteClasses);
    assert.strictEqual(response.data.bio, updateData.bio);
    console.log('Update user profile test passed!');
  } catch (error) {
    console.error('Update user profile test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreatePost() {
  console.log('8. Testing Create Post...');
  
  // Test data that matches validation rules
  const postData = {
    title: 'Test Post Title ' + Date.now(), // Ensure unique title
    content: 'This is a test post content for testing purposes. It should be long enough to be meaningful.'
    // media field omitted since it's optional
  };

  try {
    // Verify auth token is set
    if (!authToken) {
      throw new Error('Authentication token is not set. Please run login test first.');
    }

    console.log('Creating post with data:', {
      ...postData,
      authToken: '[REDACTED]' // Don't log the actual token
    });
    
    const response = await retryWithBackoff(() => 
      axios.post(`${BASE_URL}/posts`, postData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
    );

    console.log('Create Post Response:', response.data);

    // Check response status (201 for creation)
    if (response.status !== 201) {
      throw new Error(`Create post failed with status ${response.status}`);
    }

    // Validate response structure
    if (!response.data || !response.data.success) {
      throw new Error('Create post response missing success flag');
    }

    if (!response.data.data || !response.data.data.id) {
      throw new Error('Create post response missing post ID');
    }

    // Store the post ID for subsequent tests
    postId = response.data.data.id;
    
    // Verify the post was created with correct data
    const createdPost = response.data.data;
    if (createdPost.title !== postData.title || 
        createdPost.content !== postData.content) {
      throw new Error('Created post data does not match input data');
    }

    console.log('Create Post test passed\n');
  } catch (error) {
    console.error('Create Post Error:', {
      status: error.response?.status,
      data: error.response?.data,
      errors: error.response?.data?.errors,
      headers: {
        ...error.response?.headers,
        authorization: '[REDACTED]'
      }
    });
    throw error;
  }
}

async function testCreatePostWithImage() {
  console.log('8.1 Testing Create Post with Image...');
  
  try {
    if (!authToken) {
      throw new Error('Authentication token is not set. Please run login test first.');
    }

    const formData = new FormData();
    formData.append('title', 'Test Post with Image ' + Date.now());
    formData.append('content', 'This is a test post with an image.');
    
    // Add the test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    formData.append('media', fs.createReadStream(testImagePath));

    console.log('Creating post with image...');

    const response = await retryWithBackoff(() => 
      axios.post(`${BASE_URL}/posts`, formData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          ...formData.getHeaders()
        }
      })
    );

    console.log('Create Post with Image Response:', response.data);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Create post with image failed with status ${response.status}`);
    }

    if (!response.data || !response.data.data || !response.data.data.id) {
      throw new Error('Create post with image response missing post ID');
    }

    console.log('Create Post with Image test passed\n');
  } catch (error) {
    console.error('Create Post with Image Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
    throw error;
  }
}

async function testLikePost() {
  console.log('9. Testing Like Post...');
  
  try {
    if (!authToken) {
      throw new Error('Authentication token is not set. Please run login test first.');
    }

    if (!postId) {
      throw new Error('Post ID is not set. Please run create post test first.');
    }

    console.log('Liking post:', postId);

    const response = await retryWithBackoff(() => 
      axios.post(`${BASE_URL}/posts/${postId}/like`, {}, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
    );

    console.log('Like Post Response:', response.data);

    if (response.status !== 200) {
      throw new Error(`Like post failed with status ${response.status}`);
    }

    console.log('Like Post test passed\n');
  } catch (error) {
    console.error('Like Post Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
    throw error;
  }
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
    content: 'This is a test comment for testing purposes.'
  };

  try {
    if (!authToken) {
      throw new Error('Authentication token is not set. Please run login test first.');
    }

    if (!postId) {
      throw new Error('Post ID is not set. Please run create post test first.');
    }

    console.log('Adding comment to post:', postId);
    console.log('Comment data:', commentData);

    const response = await retryWithBackoff(() => 
      axios.post(`${BASE_URL}/posts/${postId}/comments`, commentData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
    );

    console.log('Add Comment Response:', response.data);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Add comment failed with status ${response.status}`);
    }

    if (!response.data || !response.data.id) {
      throw new Error('Add comment response missing comment ID');
    }

    console.log('Add Comment test passed\n');
  } catch (error) {
    console.error('Add Comment Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
    throw error;
  }
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

async function testUpdatePost() {
  console.log('13. Testing Update Post...');
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

async function testDeletePost() {
  console.log('14. Testing Delete Post...');
  const response = await retryWithBackoff(() => 
    axios.delete(`${BASE_URL}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (response.status !== 200 && response.status !== 204) {
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

async function testDeleteComment() {
  console.log('17. Testing Delete Comment...');
  
  // First create a new post for the comment
  const postData = {
    title: 'Test Post for Comment Deletion',
    content: 'This post will be used to test comment deletion.'
  };

  const createPostResponse = await retryWithBackoff(() => 
    axios.post(`${BASE_URL}/posts`, postData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
  );

  if (createPostResponse.status !== 201) {
    throw new Error('Create post for comment deletion failed');
  }

  const commentPostId = createPostResponse.data.data.id;

  // Create a comment to delete
  const commentData = {
    content: 'Test comment to delete'
  };

  const createResponse = await retryWithBackoff(() => 
    axios.post(`${BASE_URL}/posts/${commentPostId}/comments`, commentData, {
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
    axios.delete(`${BASE_URL}/posts/${commentPostId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
  );

  if (deleteResponse.status !== 200) {
    throw new Error('Delete comment failed');
  }
  console.log('Delete Comment test passed\n');
}

// Manual cleanup endpoint
router.post('/cleanup-test-images', async (req, res) => {
    const result = await cleanupTestImages();
    res.json(result);
});

async function testEndpoints() {
  try {
    await startServer();
    await testHealthCheck();
    await testApiDocumentation();
    
    const registerData = await testUserRegistration();
    await testUserLogin(registerData);
    await testUpdateUserProfile();
    await testGetUserProfile();
    
    // Create a test post
    await testCreatePost();
    
    // Test post with image
    await testCreatePostWithImage();
    
    // Test post interactions
    await testLikePost();
    await testUnlikePost();
    await testAddComment();
    
    // Test post retrieval and management
    await testGetPost();
    await testUpdatePost();
    await testDeletePost();
    await testSearchPosts();
    await testGetUserPosts();
    await testDeleteComment();

    await cleanupTestData();
    await stopServer();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await stopServer();
  }
}

// Run the tests
console.log('Starting test suite...');
testEndpoints()
  .then(() => {
    console.log('TEST COMPLETE');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  }); 