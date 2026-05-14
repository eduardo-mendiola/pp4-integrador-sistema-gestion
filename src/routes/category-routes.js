import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/permissionMiddleware.js';

const router = express.Router();
const canEditCatalog = hasRole('admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive');

router.use(isAuthenticated);

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', canEditCatalog, CategoryController.create);
router.put('/:id', canEditCatalog, CategoryController.update);
router.delete('/:id', canEditCatalog, CategoryController.remove);

export default router;