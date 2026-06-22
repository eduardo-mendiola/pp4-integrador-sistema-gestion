import express from 'express';
import ReportController from '../controllers/ReportController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Report routes
router.get("/cash-closing", ReportController.getCashClosing);
router.get("/sales", ReportController.getSales);
router.get("/movements", ReportController.getMovements);
router.get("/top-products", ReportController.getTopProducts);
router.get("/returns", ReportController.getReturns);

export default router;