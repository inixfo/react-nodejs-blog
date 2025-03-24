import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const getMe = () => api.get('/auth/me');

// Posts
export const getPosts = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return api.get(`/posts?${queryParams}`);
};
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (postData) => {
  const headers = postData instanceof FormData 
    ? { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    : {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

  return api.post('/posts', postData, { headers });
};
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const likePost = (id) => api.put(`/posts/${id}/like`);
export const searchPosts = async (searchQuery) => {
  try {
    const response = await api.get(`/posts/search`, {
      params: {
        query: searchQuery
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Comments
export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId, data) => api.post(`/posts/${postId}/comments`, data);
export const updateComment = (id, data) => api.put(`/comments/${id}`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const likeComment = (id) => api.put(`/comments/${id}/like`);
export const reportComment = (id, data) => api.post(`/comments/${id}/report`, data);
export const getReportedComments = () => api.get('/comments/reported');
export const handleReportedComment = (id, data) => api.put(`/comments/${id}/handle-report`, data);

// Reports
export const createReport = (data) => api.post('/reports', data);
export const getReports = () => api.get('/reports');
export const getReportsByStatus = (status) => api.get(`/reports/status/${status}`);
export const getReport = (id) => api.get(`/reports/${id}`);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const updateReportStatus = (id, status) => api.put(`/reports/${id}`, { status });
export const deleteReport = (id) => api.delete(`/reports/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Users (Admin only)
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const updateUserStatus = (id, isApproved) => api.put(`/users/${id}`, { isApproved });
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api; 