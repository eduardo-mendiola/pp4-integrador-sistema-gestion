import express from 'express';
import ClientController from '../controllers/ClientController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/permissionMiddleware.js';

const router = express.Router();
const canEditClients = hasRole('admin', 'manager', 'Administrador', 'Gerente de Proyecto', 'CEO', 'executive');

router.use(isAuthenticated);

router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.post('/', canEditClients, ClientController.create);
router.put('/:id', canEditClients, ClientController.update);
router.delete('/:id', canEditClients, ClientController.remove);

export default router;