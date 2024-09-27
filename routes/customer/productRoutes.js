const productController = require('../../controllers/customer/productController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/product/save_review', authMiddleware, productController.saveReview);
router.get('/product/get_reviews/:productId/:pageNumber', productController.getReviews);
module.exports = router;