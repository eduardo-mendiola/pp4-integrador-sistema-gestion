import express from 'express';
import PaymentMethodController from '../controllers/PaymentMethodController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', PaymentMethodController.getAll);
router.get('/:id', PaymentMethodController.getById);
router.post('/', PaymentMethodController.create);
router.patch('/:id', PaymentMethodController.partialUpdate);
router.put('/:id', PaymentMethodController.update);
router.delete('/:id', PaymentMethodController.remove);

export default router;