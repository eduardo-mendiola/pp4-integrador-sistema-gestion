import express from 'express';
import SupplierController from '../controllers/SupplierController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Define routes for supplier-related operations
router.get('/', SupplierController.getAll);
router.get('/:id', SupplierController.getById);
router.post('/', SupplierController.create);
router.patch('/:id', SupplierController.partialUpdate);
router.put('/:id', SupplierController.update);
router.delete('/:id', SupplierController.remove);

export default router;

