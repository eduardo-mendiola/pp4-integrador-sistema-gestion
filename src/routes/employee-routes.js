import express from 'express';
import EmployeeController from '../controllers/EmployeeController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Define routes for employee-related operations
router.post('/register', EmployeeController.register);
router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.post('/', EmployeeController.create);
router.patch('/:id', EmployeeController.partialUpdate);
router.put('/:id', EmployeeController.update);
router.delete('/:id', EmployeeController.remove);

export default router;