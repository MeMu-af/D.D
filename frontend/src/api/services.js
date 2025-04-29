import api from './axios';

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { token, user };
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { token, user };
  },
  logout: () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', {
      ...userData,
      favoriteClasses: userData.favoriteClasses || [],
      experience: userData.experience || '',
      city: userData.city || '',
      state: userData.state || '',
      bio: userData.bio || ''
    });
    return response.data;
  },
};

// Post services
export const postService = {
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },
  getPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },
  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
  unlikePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },
  addComment: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },
  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
  searchPosts: async (query) => {
    const response = await api.get('/posts/search', { params: { query } });
    return response.data;
  },
  getUserPosts: async (userId) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },
  uploadMedia: async (formData) => {
    const response = await api.post('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// User services
export const userService = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  searchUsers: (query) => api.get('/users/search', { params: query }),
  getProfilePicture: (userId) => api.get(`/users/${userId}/profile-picture`, {
    responseType: 'blob'
  }),
  uploadProfilePicture: (userId, formData) => api.post(`/users/${userId}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Game sessions services
export const gameSessionService = {
  createSession: (sessionData) => api.post('/game-sessions', sessionData),
  getSessions: (params) => api.get('/game-sessions', { params }),
  getSession: (sessionId) => api.get(`/game-sessions/${sessionId}`),
  joinSession: (sessionId) => api.post(`/game-sessions/${sessionId}/join`),
  leaveSession: (sessionId) => api.post(`/game-sessions/${sessionId}/leave`),
};

// Forum services
export const forumService = {
  createPost: (postData) => api.post('/forum/posts', postData),
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (postId) => api.get(`/forum/posts/${postId}`),
  createComment: (postId, commentData) => api.post(`/forum/posts/${postId}/comments`, commentData),
  uploadMedia: (formData) => api.post('/forum/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Location services
export const locationService = {
  getNearbyPlayers: (params) => api.get('/locations/nearby', { params }),
  updateLocation: (locationData) => api.put('/locations/me', locationData),
}; 