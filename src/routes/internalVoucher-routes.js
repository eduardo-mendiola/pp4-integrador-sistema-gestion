import express from 'express';
import InternalVoucherController from '../controllers/InternalVoucherController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Listar comprobantes con filtros
router.get("/", InternalVoucherController.getAll);
// Resumen por período
router.get("/summary", InternalVoucherController.getSummary);
// Crear comprobante
router.post("/", InternalVoucherController.create);
// Detalle de un comprobante
router.get("/:id", InternalVoucherController.getById);
// Cancelar comprobante
router.patch("/:id/cancel", InternalVoucherController.cancel);

export default router;