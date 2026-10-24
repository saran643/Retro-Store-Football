import axios from 'axios';

// Format Indian Rupee currency standard
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on a protected route, emit event
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/account') || currentPath.startsWith('/checkout') || currentPath.startsWith('/admin/dashboard')) {
        localStorage.removeItem('retro_token');
        localStorage.removeItem('retro_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data)
};

// Product Service
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getBudget: (limit = 8) => api.get('/products/budget', { params: { limit } })
};

// Cart Service
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateQuantity: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart')
};

// Wishlist Service
export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (product_id) => api.post('/wishlist', { product_id }),
  removeItem: (id) => api.delete(`/wishlist/${id}`)
};

// Order Service
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`)
};

// Admin Service
export const adminService = {
  getStats: () => api.get('/admin/dashboard'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  uploadImage: (formData) => api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getInventory: (params) => api.get('/admin/inventory', { params }),
  updateVariantStock: (id, stock_quantity) => api.put(`/admin/inventory/variants/${id}`, { stock_quantity })
};

export default api;
