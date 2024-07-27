const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/admin-login', authController.admin_login);
router.get('/get-info', authMiddleware, authController.getUserInfo);
router.post('/seller-register', authController.sellerRegister);
router.post('/seller-login', authController.seller_login);
module.exports = router;