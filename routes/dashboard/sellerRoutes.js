const sellerController = require('../../controllers/dashboard/sellerController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.get('/sellers-get-pending', authMiddleware, sellerController.getAllPeding);
router.get('/sellers-get-active', authMiddleware, sellerController.getAllActive);
router.get('/sellers-get-deactive', authMiddleware, sellerController.getAllDeactive);
router.get('/seller-get/:sellerId', authMiddleware, sellerController.getSeller);
router.put('/seller-update-status', authMiddleware, sellerController.updateStatus);
module.exports = router;