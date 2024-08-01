const productController = require('../../controllers/dashboard/productController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/product-add', authMiddleware, productController.add);
router.get('/products-get', authMiddleware, productController.getAll);
module.exports = router;