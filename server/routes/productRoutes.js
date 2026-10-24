const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product listing, filtering, search
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/budget', productController.getBudgetProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

module.exports = router;
