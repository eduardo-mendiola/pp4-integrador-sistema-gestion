import express from 'express';
import DiscountRuleController from '../controllers/DiscountRuleController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', DiscountRuleController.getAll);
router.get('/:id', DiscountRuleController.getById);
router.get('/:id/promotions-count', DiscountRuleController.getPromotionsCount);
router.post('/', DiscountRuleController.create);
router.patch('/:id', DiscountRuleController.partialUpdate);
router.put('/:id', DiscountRuleController.update);
router.delete('/:id', DiscountRuleController.delete);

export default router;