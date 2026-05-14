import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from './config/passport.js'
import productRoutes from './routes/product-routes.js'
import authRoutes from './routes/auth-routes.js'
import categoryRoutes from './routes/category-routes.js'
import clientRoutes from './routes/client-routes.js'
import saleRoutes from './routes/sale-routes.js'
import userRoutes from './routes/user-routes.js'
import roleRoutes from './routes/role-routes.js'

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI_ATLAS || process.env.MONGO_URI
})

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}))

app.use(passport.initialize())
app.use(passport.session())

// Session-based auth API
app.use('/api/auth', authRoutes)

// Inventory API
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Fallback 404 for unknown API routes — backend exposes only `/api/*`
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

export default app
