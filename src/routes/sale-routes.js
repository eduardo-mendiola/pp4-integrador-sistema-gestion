import express from 'express';
import SaleController from '../controllers/SaleController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', SaleController.getAll);
router.get('/:id', SaleController.getById);
router.post('/', SaleController.create);
router.patch('/:id', SaleController.partialUpdate);
router.put('/:id', SaleController.update);
router.delete('/:id', SaleController.remove);

export default router;