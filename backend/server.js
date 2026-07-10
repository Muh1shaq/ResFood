const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Database context is now handled directly by each router using supabaseClient.js


// Import Routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foods');
const donationRoutes = require('./routes/donations');
const impactRoutes = require('./routes/impact');

// API Routing Setup
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/impact', impactRoutes);

// Fallback to landing page for SPA routing or single pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`   ResFood Server is running on port ${PORT}      `);
  console.log(`   URL: http://localhost:${PORT}                  `);
  console.log(`===================================================`);
});
