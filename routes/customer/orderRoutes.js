const orderController = require('../../controllers/customer/orderController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/order/place_order', authMiddleware, orderController.placeOrder);
router.get('/order/get-orders/:status', authMiddleware, orderController.getOrders);
router.get('/order/get-order/:orderId', authMiddleware, orderController.getOrder);
module.exports = router;