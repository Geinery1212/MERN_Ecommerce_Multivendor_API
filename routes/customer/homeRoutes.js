const homeController = require('../../controllers/customer/homeController');

const router = require('express').Router();
router.get('/get-categories', homeController.getAllCategories);
router.get('/get-products', homeController.getProducts);
router.get('/price-range-product', homeController.getPriceRangeProduct);
router.get('/filter-products', homeController.getFilteredProduts);

module.exports = router;