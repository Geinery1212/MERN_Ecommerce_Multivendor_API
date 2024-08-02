const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/admin-login', authController.adminLogin);
router.get('/get-info', authMiddleware, authController.getUserInfo);
router.post('/seller-register', authController.sellerRegister);
router.post('/seller-login', authController.sellerLogin);
router.post('/profile-image-update', authMiddleware, authController.profileImageUpload);
router.post('/add-shop-data', authMiddleware, authController.addShopData);
module.exports = router;