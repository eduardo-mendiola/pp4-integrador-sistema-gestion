import express from 'express';
import ReturnController from '../controllers/ReturnController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', ReturnController.getAll);
router.get('/:id', ReturnController.getById);
router.post('/', ReturnController.create);

export default router;