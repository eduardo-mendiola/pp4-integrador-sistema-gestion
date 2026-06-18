import express from 'express';
import CashFlowController from '../controllers/CashFlowController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Listar movimientos con filtros
router.get("/", CashFlowController.getAll);

// Resumen por período
router.get("/summary", CashFlowController.getSummary);

// Crear movimiento manual
router.post("/", CashFlowController.create);

// Detalle de un movimiento
router.get("/:id", CashFlowController.getById);

// Eliminar movimiento manual
router.delete("/:id", CashFlowController.delete);

export default router;