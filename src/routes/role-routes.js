import express from 'express';
import RoleController from '../controllers/RoleController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);


router.get('/', RoleController.getAll);
router.get('/:id', RoleController.getById);
router.post('/', RoleController.create);
router.patch('/:id', RoleController.partialUpdate);
router.put('/:id', RoleController.update);
router.delete('/:id', RoleController.remove);

export default router;