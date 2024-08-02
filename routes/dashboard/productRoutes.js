const productController = require('../../controllers/dashboard/productController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/product-add', authMiddleware, productController.add);
router.get('/products-get', authMiddleware, productController.getAll);
router.get('/product-get/:productId', authMiddleware, productController.getProduct);
router.post('/product-update', authMiddleware, productController.update);
router.post('/product-image-update', authMiddleware, productController.updateImage);
module.exports = router;