const chatController = require('../../controllers/chat/chatController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/customer/add-friend-seller', authMiddleware, chatController.addNewFriendSeller);
router.post('/customer/send-message-to-seller', authMiddleware, chatController.sendNewMessageCustomerToSeller);
module.exports = router;