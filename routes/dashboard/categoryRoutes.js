const categoryController = require('../../controllers/dashboard/categoryController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = require('express').Router();
router.post('/category-add', authMiddleware, categoryController.add);
router.get('/category-get', categoryController.getAll);
router.put('/category-update/:id', authMiddleware, categoryController.update);
router.delete('/category-delete/:id', authMiddleware, categoryController.deleteCategory);
module.exports = router;