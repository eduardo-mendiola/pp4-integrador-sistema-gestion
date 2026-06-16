import express from 'express';
import CashRegisterController from '../controllers/CashRegisterController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Estado actual de la caja
router.get("/status", CashRegisterController.getStatus);
// Resumen del día
router.get("/daily-summary", CashRegisterController.getDailySummary);
// Abrir caja
router.post("/open", CashRegisterController.open);
// Cerrar caja
router.post("/close", CashRegisterController.close);
// Listar historial de cajas
router.get("/", CashRegisterController.getAll);
// Detalle de una caja
router.get("/:id", CashRegisterController.getById);

export default router;