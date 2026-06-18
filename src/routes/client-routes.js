import express from 'express';
import ClientController from '../controllers/ClientController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.post('/', ClientController.create);
router.patch('/:id', ClientController.partialUpdate);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.remove);

export default router;