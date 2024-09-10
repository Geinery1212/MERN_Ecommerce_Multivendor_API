const dashboardController = require('../../controllers/customer/dashboardController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.get('/dashboard/get-index-data', authMiddleware, dashboardController.getIndexData);
module.exports = router;