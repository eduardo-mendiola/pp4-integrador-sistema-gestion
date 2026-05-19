import express from 'express';
import EmployeeController from '../controllers/EmployeeController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.post('/register', EmployeeController.register);

router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.post('/', EmployeeController.create);
router.put('/:id', EmployeeController.update);
router.delete('/:id', EmployeeController.remove);
// router.post('/:id/calculate-salary', EmployeeController.calculateSalary);
export default router;