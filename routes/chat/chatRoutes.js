const chatController = require('../../controllers/chat/chatController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/customer/add-friend-seller', authMiddleware, chatController.addNewFriendSeller);
router.post('/customer/send-message-to-seller', authMiddleware, chatController.sendNewMessageCustomerToSeller);
router.post('/seller/send-message-seller-to-customer', authMiddleware, chatController.sendNewMessageSellerToCustomer);
router.get('/seller/get-customer-friends/:sellerId/:customerId?', authMiddleware, chatController.getCustomerFriends);
module.exports = router;