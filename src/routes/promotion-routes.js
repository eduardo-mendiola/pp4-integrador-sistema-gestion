import express from 'express';
import PromotionController from '../controllers/PromotionController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', PromotionController.getAll);
router.get('/:id', PromotionController.getById);
router.post('/', PromotionController.create);
router.put('/:id', PromotionController.update);
router.delete('/:id', PromotionController.remove);

export default router;