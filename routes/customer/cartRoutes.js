const cartController = require('../../controllers/customer/cartController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/cart/add', cartController.add);
router.get('/cart/get_products/:userId', cartController.getProducts);
router.delete('/cart/delete-product/:cartId', authMiddleware, cartController.deleteProduct)
router.put('/cart/quantity-inc', authMiddleware, cartController.quantityInc)
router.put('/cart/quantity-dec', authMiddleware, cartController.quantityDec)
module.exports = router;