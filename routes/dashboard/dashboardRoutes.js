const dashboardController = require('../../controllers/dashboard/dashboardController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.get('/admin/get-dashboard-data', authMiddleware, dashboardController.getAdminDashboardData);
router.get('/seller/get-dashboard-data', authMiddleware, dashboardController.getSellerDashboardData);

module.exports = router;