import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.get('/brands', ProductController.getUniqueBrands);
router.post('/', ProductController.create);
router.patch('/:id', ProductController.partialUpdate);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.remove);

export default router;