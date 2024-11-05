const paymentController = require('../../controllers/payment/paymentController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.get('/create-stripe-connect-account', authMiddleware, paymentController.createStripeConnectAccount);
router.put('/active-stripe-connect-account/:activeCode', authMiddleware, paymentController.activeStripeConnectAccount);
router.post('/create-payment-order', authMiddleware, paymentController.createPaymentOrder);
module.exports = router;