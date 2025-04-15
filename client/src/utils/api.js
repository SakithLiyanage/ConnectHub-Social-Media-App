import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for all requests
axios.defaults.baseURL = 'http://localhost:5000/api';

// Add auth token to all requests if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API errors consistently
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

const api = {
  // Auth
  register: async (userData) => {
    const res = await axios.post('/users/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await axios.post('/users/login', credentials);
    return res.data;
  },
  getCurrentUser: async () => {
    try {
      const res = await axios.get('/users/me');
      return res.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
  
  // Users
  getUsers: async () => {
    try {
      const res = await axios.get('/users');
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },
  getUser: async (id) => {
    try {
      const res = await axios.get(`/users/${id}`);
      return res.data.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },
  updateProfile: async (userData) => {
    const res = await axios.put('/users/profile', userData);
    return res.data;
  },
  updateProfileImage: async (formData) => {
    const res = await axios.put('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  followUser: async (userId) => {
    const res = await axios.put(`/users/follow/${userId}`);
    return res.data;
  },
  unfollowUser: async (userId) => {
    const res = await axios.put(`/users/unfollow/${userId}`);
    return res.data;
  },
  
  // Posts
  getPosts: async () => {
    try {
      const res = await axios.get('/posts');
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },
  getFeed: async () => {
    try {
      const res = await axios.get('/posts/feed');
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
  },
  getUserPosts: async (userId) => {
    try {
      const res = await axios.get(`/posts/user/${userId}`);
      return res.data.data || [];
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      return [];
    }
  },
  createPost: async (formData) => {
    const res = await axios.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  updatePost: async (postId, postData) => {
    const res = await axios.put(`/posts/${postId}`, postData);
    return res.data;
  },
  deletePost: async (postId) => {
    const res = await axios.delete(`/posts/${postId}`);
    return res.data;
  },
  likePost: async (postId) => {
    const res = await axios.put(`/posts/like/${postId}`);
    return res.data;
  },
  unlikePost: async (postId) => {
    const res = await axios.put(`/posts/unlike/${postId}`);
    return res.data;
  },
  
  // Comments
  addComment: async (postId, text) => {
    const res = await axios.post(`/posts/comment/${postId}`, { text });
    return res.data;
  },
  deleteComment: async (postId, commentId) => {
    const res = await axios.delete(`/posts/comment/${postId}/${commentId}`);
    return res.data;
  },
};

export default api;