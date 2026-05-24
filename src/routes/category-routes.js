import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.patch('/:id', CategoryController.partialUpdate);
router.delete('/:id', CategoryController.remove);

export default router;