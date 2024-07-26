const authControllers = require('../controllers/authControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/admin-login', authControllers.admin_login);
router.get('/get-info', authMiddleware, authControllers.getUserInfo);
router.post('/seller-register', authControllers.sellerRegister);
router.post('/seller-login', authControllers.seller_login);
module.exports = router;