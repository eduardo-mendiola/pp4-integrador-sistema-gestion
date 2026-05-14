import express from 'express';
import SaleController from '../controllers/SaleController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/permissionMiddleware.js';

const router = express.Router();
const canEditSales = hasRole('admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive');

router.use(isAuthenticated);

router.get('/', SaleController.getAll);
router.get('/:id', SaleController.getById);
router.post('/', canEditSales, SaleController.create);
router.put('/:id', canEditSales, SaleController.update);
router.delete('/:id', canEditSales, SaleController.remove);

export default router;