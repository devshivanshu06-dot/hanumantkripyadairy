import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change the production URL to your actual hosted backend domain
const API_URL = __DEV__ 
  ? 'http://192.168.0.6:5000/api'
  : 'https://hanumantkripyadairy.com/api';

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
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.post('/cart/update', { productId, quantity }),
  clearCart: () => api.post('/cart/clear'),
};

export const orderAPI = {
  createOrder: (deliveryAddress) => api.post('/orders', { deliveryAddress }),
  getMyOrders: () => api.get('/orders/my-orders'),
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

export default api;
