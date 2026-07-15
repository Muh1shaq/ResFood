const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CORS: allow both frontend clients (Web on 3000, Kurir on 3001)
// ============================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.WEB_CLIENT_URL,
  process.env.KURIR_CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from allowed origins or non-browser tools (e.g., Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    }
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());

// ============================================================
// API Routes
// ============================================================
const authRoutes      = require('./routes/auth');
const foodRoutes      = require('./routes/foods');
const donationRoutes  = require('./routes/donations');
const impactRoutes    = require('./routes/impact');

app.use('/api/auth',      authRoutes);
app.use('/api/foods',     foodRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/impact',    impactRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ResFoodBackend', timestamp: new Date().toISOString() });
});

// 404 fallback for unknown API routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint tidak ditemukan' });
});

// Start Server
app.listen(PORT, () => {
  console.log('===================================================');
  console.log(`   ResFoodBackend API running on port ${PORT}     `);
  console.log(`   http://localhost:${PORT}/api/health             `);
  console.log('===================================================');
});
