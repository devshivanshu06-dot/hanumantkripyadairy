import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Change the production URL to your actual hosted backend domain
// const API_URL = 'https://hanumantkripyadairy-backend-mrcrafter32-mrcrafter32s-projects.vercel.app/api';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (token, data) => api.put('/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateFCMToken: (fcmToken) => api.post('/auth/fcm-token', { fcmToken }),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
};



export const subscriptionAPI = {
  createSubscription: (data) => api.post('/subscriptions', data),
  getMySubscriptions: () => api.get('/subscriptions/my-subscriptions'),
  pauseSubscription: (id, pausedUntil) => api.post(`/subscriptions/${id}/pause`, { pausedUntil }),
  resumeSubscription: (id) => api.post(`/subscriptions/${id}/resume`),
  skipDate: (id, date) => api.post(`/subscriptions/${id}/skip`, { date }),
  cancelSubscription: (id) => api.post(`/subscriptions/${id}/cancel`),
};

export const addressAPI = {
  addAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

export const bannerAPI = {
  getActiveBanners: () => api.get('/banners/active'),
};

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  addMoney: (data) => api.post('/wallet/add-money', data),
};

export const customerAPI = {
  getLivestreams: () => api.get('/customer/livestreams'),
};

export const orderAPI = {
  getMyOrders: () => api.get('/orders/my-orders'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: () => api.post('/notifications/mark-read'),
};

export default api;
