import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';

// Routes
import authRoutes from './routes/auth-routes.js';
import productRoutes from './routes/product-routes.js';
import categoryRoutes from './routes/category-routes.js';
import supplierRoutes from './routes/supplier-routes.js';
import clientRoutes from './routes/client-routes.js'
import saleRoutes from './routes/sale-routes.js'
import userRoutes from './routes/user-routes.js'
import roleRoutes from './routes/role-routes.js'
import personRoutes from './routes/person-routes.js'
import employeeRoutes from './routes/employee-routes.js'
import discountRulesRoutes from './routes/discountRule-routes.js'
import paymentMethodRoutes from './routes/paymentMethod-routes.js'
import promotionRoutes from './routes/promotion-routes.js'


const app = express();

// ======================
// CORE MIDDLEWARES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// SESSION STORE
// ======================
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI_ATLAS || process.env.MONGO_URI
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// ======================
// PASSPORT
// ======================
app.use(passport.initialize());
app.use(passport.session());

// ======================
// ROUTES API
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/discount-rules', discountRulesRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/promotions', promotionRoutes);


// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;