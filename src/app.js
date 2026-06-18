import express from 'express';
import cors from 'cors';
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
import returnRoutes from './routes/return-routes.js'
import cashRegisterRoutes from "./routes/cashRegister-routes.js";
import cashFlowRoutes from "./routes/cashFlow-routes.js";
import internalVoucherRoutes from "./routes/internalVoucher-routes.js";


const app = express();

// ======================
// CORS CONFIGURATION 
// ======================
const allowedOrigins = [
  'http://localhost:5173', // Vite local
  'http://localhost:4000', 
  process.env.FRONTEND_URL // La URL de Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (Postman, móviles) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================
// TRUST PROXY 
// ======================
app.set('trust proxy', 1); 

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

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7  // ← 7 días en milisegundos
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
app.use('/api/returns', returnRoutes);
app.use("/api/cash-register", cashRegisterRoutes);
app.use("/api/cash-flow", cashFlowRoutes);
app.use("/api/internal-vouchers", internalVoucherRoutes);

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