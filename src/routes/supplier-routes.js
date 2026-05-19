import express from 'express';
const router = express.Router();

import SupplierController from '../controllers/SupplierController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/permissionMiddleware.js';

const canEditInventory = hasRole(
  'admin',
  'manager',
  'Administrador',
  'Gerente de Proyecto',
  'CEO',
  'executive'
);

router.use(isAuthenticated);

router.get('/', SupplierController.getAll);
router.get('/:id', SupplierController.getById);
router.post('/', canEditInventory, SupplierController.create);
router.put('/:id', canEditInventory, SupplierController.update);
router.delete('/:id', canEditInventory, SupplierController.remove);

export default router;