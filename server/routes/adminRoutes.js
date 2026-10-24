const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Strict administrator authorization for every admin route
router.use(verifyToken, requireAdmin);

// Dashboard overview statistics
router.get('/dashboard', adminController.getDashboardStats);

// Product management
router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Image upload
router.post('/upload', upload.single('image'), adminController.uploadProductImage);

// Category management
router.get('/categories', adminController.getAdminCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Order management
router.get('/orders', adminController.getAdminOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// User management
router.get('/users', adminController.getAdminUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Inventory management
router.get('/inventory', adminController.getInventory);
router.put('/inventory/variants/:id', adminController.updateVariantStock);

module.exports = router;
