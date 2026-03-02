import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
};

export const adminAPI = {
  // Products
  getProducts: () => api.get('/products'),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Subscriptions
  getSubscriptions: () => api.get('/subscriptions/admin/all'),
  updateSubscriptionStatus: (id, status) => api.put(`/subscriptions/${id}/status`, { status }),

  // Orders
  getOrders: () => api.get('/orders/admin/all'),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

  // Customers
  getCustomers: () => api.get('/auth/admin/users'), // Need to add this route or similar
};

export default api;
