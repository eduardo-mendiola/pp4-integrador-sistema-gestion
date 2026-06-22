import express from 'express';
import CashRegisterController from '../controllers/CashRegisterController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Define routes for cash register
router.get("/status", CashRegisterController.getStatus);
router.get("/daily-summary", CashRegisterController.getDailySummary);
router.post("/open", CashRegisterController.open);
router.post("/close", CashRegisterController.close);
router.get("/", CashRegisterController.getAll);
router.get("/:id", CashRegisterController.getById);

export default router;