import express from 'express';
import UserController from '../controllers/UserController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/permissionMiddleware.js';

const router = express.Router();
const canManageUsers = hasRole('admin', 'Administrador', 'CEO');

router.use(isAuthenticated);

router.get('/', canManageUsers, UserController.getAll);
router.get('/:id', canManageUsers, UserController.getById);
router.post('/', canManageUsers, UserController.create);
router.patch('/:id', canManageUsers, UserController.partialUpdate);
router.put('/:id', canManageUsers, UserController.update);
router.delete('/:id', canManageUsers, UserController.remove);

export default router;