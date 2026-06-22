import express from 'express';
import CashFlowController from '../controllers/CashFlowController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Define routes for cash flow
router.get("/", CashFlowController.getAll);
router.get("/summary", CashFlowController.getSummary);
router.post("/", CashFlowController.create);
router.get("/:id", CashFlowController.getById);
router.delete("/:id", CashFlowController.delete);

export default router;