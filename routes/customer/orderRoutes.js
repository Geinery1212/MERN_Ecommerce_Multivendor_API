const orderController = require('../../controllers/customer/orderController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/order/place_order', authMiddleware, orderController.placeOrder);
module.exports = router;