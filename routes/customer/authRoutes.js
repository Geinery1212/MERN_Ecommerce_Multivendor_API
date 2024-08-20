const authController = require('../../controllers/customer/authController');

const router = require('express').Router();
router.post('/register', authController.customerRegister);
module.exports = router;