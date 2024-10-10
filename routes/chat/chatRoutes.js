const chatController = require('../../controllers/chat/chatController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/customer/add-friend-seller', authMiddleware, chatController.addNewFriendSeller);
router.post('/customer/send-message-to-seller', authMiddleware, chatController.sendNewMessageCustomerToSeller);
router.post('/seller/send-message-seller-to-customer', authMiddleware, chatController.sendNewMessageSellerToCustomer);
router.get('/seller/get-customer-friends/:sellerId/:customerId?', authMiddleware, chatController.getCustomerSellerFriends);

router.post('/seller/send-message-seller-to-admin', authMiddleware, chatController.sendNewMessageSellerToAdmin);
router.get('/seller/get-messages-seller-to-admin', authMiddleware, chatController.getMessagesSellerToAdmin);
router.get('/admin/get-seller-admin-friends/:adminId/:sellerId?', authMiddleware, chatController.getSellerAdminFriends);
router.post('/admin/send-message-admin-to-seller', authMiddleware, chatController.sendNewMessageAdminToSeller);
module.exports = router;