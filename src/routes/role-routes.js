import express from 'express';
import RoleController from '../controllers/RoleController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', RoleController.getAll);
router.get('/:id', RoleController.getById);

export default router;