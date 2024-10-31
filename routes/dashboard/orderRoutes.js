const orderController = require('../../controllers/dashboard/orderController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.get('/admin/orders', authMiddleware, orderController.getOrdersAdmin);
router.get('/admin/order/:orderId', authMiddleware, orderController.getOrderAdmin);
router.put('/admin/order/:orderId', authMiddleware, orderController.updateOrderStatusAdmin);

router.get('/seller/orders', authMiddleware, orderController.getOrdersSeller);
router.get('/seller/order/:orderId', authMiddleware, orderController.getOrderSeller);
router.put('/seller/order/:orderId', authMiddleware, orderController.updateOrderStatusSeller);
module.exports = router;