import express from 'express';
const router = express.Router();

import ProductController from '../controllers/ProductController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/permissionMiddleware.js';

const canEditInventory = hasRole('admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive');

router.use(isAuthenticated);

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', canEditInventory, ProductController.create);
router.put('/:id', canEditInventory, ProductController.update);
router.delete('/:id', canEditInventory, ProductController.remove);

export default router;
