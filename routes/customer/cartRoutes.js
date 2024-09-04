const cartController = require('../../controllers/customer/cartController');

const router = require('express').Router();
router.post('/cart/add', cartController.add);
router.get('/cart/get_products/:userId', cartController.getProducts);
module.exports = router;