import express from 'express';
import ReportController from '../controllers/ReportController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Reporte de cierre de caja
router.get("/cash-closing", ReportController.getCashClosing);

// Reporte de ventas por período
router.get("/sales", ReportController.getSales);

// Reporte de movimientos de caja
router.get("/movements", ReportController.getMovements);

// Reporte de productos más vendidos
router.get("/top-products", ReportController.getTopProducts);

// Reporte de devoluciones
router.get("/returns", ReportController.getReturns);

export default router;