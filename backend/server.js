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

// Mock database storage in memory
const db = {
  users: [
    { id: '1', email: 'mitra@resfood.com', password: 'password123', name: 'Bakery Aroma Indah', role: 'restaurant' },
    { id: '2', email: 'panti@resfood.com', password: 'password123', name: 'Panti Asuhan Kasih Bunda', role: 'nonprofit' },
    { id: '3', email: 'budi@resfood.com', password: 'password123', name: 'Budi Santoso', role: 'public' },
    { id: '4', email: 'relawan@resfood.com', password: 'password123', name: 'Hendra Saputra', role: 'courier' }
  ],
  foods: [
    {
      id: "1",
      restaurantId: "1",
      restaurantName: "Bakery Aroma Indah",
      title: "Donat & Muffin Aneka Rasa (Satu Kotak)",
      description: "Satu kotak berisi 6 donat campuran rasa cokelat, keju, dan stroberi. Masih sangat empuk dan diproduksi pagi ini.",
      originalPrice: 60000,
      discountPrice: 20000,
      quantity: 4,
      expiryTime: "Hari ini, 22:00 WIB",
      imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
      category: "roti & kue",
      isHalal: true,
      latitude: -6.2100,
      longitude: 106.8400,
      distance: 0.8,
      type: "surplus",
      safetyStatus: "Terverifikasi Aman (Suhu Ruang, < 4 Jam)",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      restaurantId: "1",
      restaurantName: "Warung Sederhana Bu Joko",
      title: "Nasi Rames Rendang Lengkap",
      description: "Nasi rames dengan lauk utama rendang sapi, sayur nangka, sambal ijo, dan daun singkong. Makanan surplus makan siang yang belum tersentuh.",
      originalPrice: 35000,
      discountPrice: 12000,
      quantity: 2,
      expiryTime: "Hari ini, 17:00 WIB",
      imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80",
      category: "makanan berat",
      isHalal: true,
      latitude: -6.2050,
      longitude: 106.8500,
      distance: 1.5,
      type: "surplus",
      safetyStatus: "Terverifikasi Aman (Suhu Ruang, < 2 Jam)",
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      restaurantId: "5",
      restaurantName: "Supermarket Segar Abadi",
      title: "Keranjang Buah Musiman (Apel & Jeruk)",
      description: "Keranjang buah berisi buah segar dengan sedikit cacat kulit luar namun bagian dalam masih sangat manis dan baik dikonsumsi.",
      originalPrice: 45000,
      discountPrice: 15000,
      quantity: 6,
      expiryTime: "Besok, 12:00 WIB",
      imageUrl: "https://images.unsplash.com/photo-1610832958506-ee56336191d1?w=400&q=80",
      category: "buah & sayur",
      isHalal: true,
      latitude: -6.2150,
      longitude: 106.8450,
      distance: 2.1,
      type: "surplus",
      safetyStatus: "Terverifikasi Segar (Uji Fisik & Organoleptik)",
      createdAt: new Date().toISOString()
    }
  ],
  donations: [
    {
      id: "1",
      name: "Panti Asuhan Kasih Bunda",
      title: "Kebutuhan Roti & Susu Balita",
      description: "Mencari surplus makanan dari bakery atau swalayan berupa roti tawar, kue basah, dan susu balita untuk santapan sore adik-adik panti.",
      target: 50,
      current: 32,
      deadline: "Hari ini, 18:00 WIB",
      status: "Berlangsung",
      safetyProtocol: "Suhu Dingin & Kemasan Segel",
      volunteers: []
    },
    {
      id: "2",
      name: "Dapur Umum Kelompok Relawan Ciliwung",
      title: "Bahan Makanan Mentah (Sayuran & Protein)",
      description: "Membutuhkan bahan mentah segar seperti sisa sortiran buah/sayur layak konsumsi dari swalayan atau perkebunan untuk diolah menjadi makanan siap saji warga terdampak banjir.",
      target: 100,
      current: 45,
      deadline: "Besok, 10:00 WIB",
      status: "Berlangsung",
      safetyProtocol: "Uji Kualitas Bahan Mentah Layak Olah",
      volunteers: []
    }
  ],
  claims: [],
  impact: {
    totalRescuedKg: 25480,
    totalPortionsServed: 18240,
    totalActivePartners: 142,
    co2ReducedKg: 63700,
    economicValueSavedRupiah: 372000000,
    safetyAuditLog: [
      { id: "LOG-001", timestamp: new Date(Date.now() - 3600000).toISOString(), partner: "Bakery Aroma Indah", action: "Suhu makanan diverifikasi 24°C - Layak Konsumsi", type: "Safety Check" },
      { id: "LOG-002", timestamp: new Date(Date.now() - 7200000).toISOString(), partner: "Warung Sederhana Bu Joko", action: "Nasi Rames Rendang diverifikasi uji visual & bau - Layak Konsumsi", type: "Safety Check" },
      { id: "LOG-003", timestamp: new Date(Date.now() - 10800000).toISOString(), partner: "Supermarket Segar Abadi", action: "Sortir buah apel & jeruk - Kadar gula & kelayakan fisik baik", type: "Safety Check" }
    ]
  }
};

// Share database context with routers
app.use((req, res, next) => {
  req.db = db;
  next();
});

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
