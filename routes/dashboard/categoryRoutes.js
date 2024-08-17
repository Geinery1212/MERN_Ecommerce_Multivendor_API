const categoryController = require('../../controllers/dashboard/categoryController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/category-add', authMiddleware, categoryController.add);
router.get('/category-get', categoryController.getAll);
module.exports = router;