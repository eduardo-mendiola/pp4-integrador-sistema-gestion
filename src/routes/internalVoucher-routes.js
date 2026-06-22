import express from 'express';
import InternalVoucherController from '../controllers/InternalVoucherController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Define routes for internal voucher-related operations
router.get("/", InternalVoucherController.getAll);
router.get("/summary", InternalVoucherController.getSummary);
router.post("/", InternalVoucherController.create);
router.get("/:id", InternalVoucherController.getById);
router.patch("/:id/cancel", InternalVoucherController.cancel);

export default router;