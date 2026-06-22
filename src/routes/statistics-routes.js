import express from 'express';
import StatisticsController from '../controllers/StatisticsController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Get dashboard statistics
router.get("/dashboard", StatisticsController.getDashboard);

export default router;