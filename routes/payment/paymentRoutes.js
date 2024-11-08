const paymentController = require('../../controllers/payment/paymentController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.get('/create-stripe-connect-account', authMiddleware, paymentController.createStripeConnectAccount);
router.put('/active-stripe-connect-account/:activeCode', authMiddleware, paymentController.activeStripeConnectAccount);
router.post('/create-payment-order', authMiddleware, paymentController.createPaymentOrder);
router.get('/seller-payment-details', authMiddleware, paymentController.getSellerPaymentDetails);
router.post('/send-withdrawal-request', authMiddleware, paymentController.sendWithdrawalRequestSeller);
router.get('/get-payment-requests', authMiddleware, paymentController.getPaymentRequests);
router.put('/confirm-payment-request', authMiddleware, paymentController.confirmPaymentRequest);
module.exports = router;