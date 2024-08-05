const sellerController = require('../../controllers/dashboard/sellerController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.get('/sellers-get', authMiddleware, sellerController.getAll);
router.get('/seller-get/:sellerId', authMiddleware, sellerController.getSeller);
router.put('/seller-update-status', authMiddleware, sellerController.updateStatus);
module.exports = router;