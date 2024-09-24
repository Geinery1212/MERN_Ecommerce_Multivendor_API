const wishlistController = require('../../controllers/customer/wishlistController');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const router = require('express').Router();
router.post('/wishlist/add', authMiddleware, wishlistController.add);
router.get('/wishlist/get-all', authMiddleware, wishlistController.getAll);
router.delete('/wishlist/:wishlistId', authMiddleware, wishlistController.deleteOne);
module.exports = router;