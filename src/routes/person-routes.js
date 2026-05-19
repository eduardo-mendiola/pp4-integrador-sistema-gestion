import express from 'express';
import PersonController from '../controllers/PersonController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', PersonController.getAll);
router.get('/:id', PersonController.getById);
router.post('/', PersonController.create);
router.put('/:id', PersonController.update);
router.delete('/:id', PersonController.remove);

export default router;