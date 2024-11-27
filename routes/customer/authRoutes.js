const authController = require('../../controllers/customer/authController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/register', authController.customerRegister);
router.post('/login', authController.customerLogin);
router.get('/logout', authMiddleware, authController.customerLogout);
router.put('/change-password', authMiddleware, authController.changePassword);
module.exports = router;