import express from 'express'
import passport from '../config/passport.js'
import { isAuthenticated } from '../middleware/authMiddleware.js'
import * as AuthController from '../controllers/AuthController.js'

const router = express.Router()

// Public route for login
router.post('/login', AuthController.loginAPI)
router.post('/logout', isAuthenticated, AuthController.logoutAPI)
router.get('/me', isAuthenticated, AuthController.me)

export default router
