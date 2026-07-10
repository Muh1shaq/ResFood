const express = require('express');
const router = express.Router();

// Helper: generate sequential log ID safely
function generateLogId(logArray) {
  return `LOG-${String(logArray.length + 1).padStart(3, '0')}`;
}

// Get all surplus foods
router.get('/', (req, res) => {
  res.json(req.db.foods);
});

// Add new surplus food (restaurant dashboard)
router.post('/', (req, res) => {
  const { title, category, price, originalPrice, quantity, expiryTime, restaurantId, restaurantName } = req.body;
  const db = req.db;

  // Required field validation
  if (!title || !price || !quantity || !restaurantId) {
    return res.status(400).json({ success: false, message: 'Nama makanan, harga, dan jumlah porsi wajib diisi' });
  }

  // Title validation
  if (title.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Nama makanan minimal 3 karakter' });
  }

  const discountPrice = Number(price);
  const origPrice = Number(originalPrice) || discountPrice * 2;
  const qty = Number(quantity);

  // Price validation
  if (isNaN(discountPrice) || discountPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Harga diskon harus berupa angka positif' });
  }

  // Original price validation
  if (isNaN(origPrice) || origPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Harga asli harus berupa angka positif' });
  }

  // Ensure discount price is lower than original price
  if (discountPrice >= origPrice) {
    return res.status(400).json({ success: false, message: 'Harga diskon harus lebih rendah dari harga asli' });
  }

  // Quantity validation
  if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
    return res.status(400).json({ success: false, message: 'Jumlah porsi harus berupa bilangan bulat positif' });
  }

  if (qty > 1000) {
    return res.status(400).json({ success: false, message: 'Jumlah porsi tidak boleh lebih dari 1000' });
  }

  // Auto-generate some properties
  const newFood = {
    id: Date.now().toString(),
    restaurantId,
    restaurantName: restaurantName || "Mitra Restoran",
    title: title.trim(),
    description: req.body.description || `Surplus makanan segar kategori ${category} dari kami. Dijamin aman dan lezat.`,
    originalPrice: origPrice,
    discountPrice,
    quantity: qty,
    expiryTime: expiryTime || "Hari ini, 21:00 WIB",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    category: category || "makanan berat",
    isHalal: req.body.isHalal !== undefined ? req.body.isHalal : true,
    latitude: req.body.latitude || -6.2100 + (Math.random() - 0.5) * 0.02,
    longitude: req.body.longitude || 106.8400 + (Math.random() - 0.5) * 0.02,
    distance: Math.round((0.5 + Math.random() * 2.5) * 10) / 10,
    type: "surplus",
    safetyStatus: "Terverifikasi Aman (Suhu Ruang, < 3 Jam)",
    createdAt: new Date().toISOString()
  };

  db.foods.push(newFood);

  // Update Core Infrastructure Metrics (carbon reduced, etc.)
  // Saving 1 portion roughly reduces 2.5 kg of CO2, and adds value back
  db.impact.co2ReducedKg += Math.round(qty * 2.5);
  db.impact.totalRescuedKg += Math.round(qty * 0.5); // assuming 0.5kg per portion

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: generateLogId(db.impact.safetyAuditLog),
    timestamp: new Date().toISOString(),
    partner: newFood.restaurantName,
    action: `Makanan baru '${newFood.title}' ditambahkan dengan status safety: ${newFood.safetyStatus}`,
    type: "Safety Check"
  });

  res.status(201).json({ success: true, message: 'Surplus makanan berhasil dipasang', food: newFood });
});

// Delete surplus food
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = req.db;

  const initialLength = db.foods.length;
  db.foods = db.foods.filter(f => f.id !== id);

  if (db.foods.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });
  }

  res.json({ success: true, message: 'Makanan surplus berhasil dihapus' });
});

// Claim food surplus (marketplace checkout)
router.post('/claim', (req, res) => {
  const { foodId, quantity, userId, userName } = req.body;
  const db = req.db;

  if (!foodId || !quantity || !userId) {
    return res.status(400).json({ success: false, message: 'ID Makanan, jumlah porsi, dan ID Pengguna wajib diisi' });
  }

  const claimQty = Number(quantity);

  // Validate claim quantity
  if (isNaN(claimQty) || claimQty <= 0 || !Number.isInteger(claimQty)) {
    return res.status(400).json({ success: false, message: 'Jumlah klaim harus berupa bilangan bulat positif' });
  }

  const foodIndex = db.foods.findIndex(f => f.id === foodId);
  if (foodIndex === -1) {
    return res.status(404).json({ success: false, message: 'Makanan surplus tidak ditemukan atau sudah habis' });
  }

  const foodItem = db.foods[foodIndex];

  if (foodItem.quantity < claimQty) {
    return res.status(400).json({ success: false, message: `Stok tidak mencukupi. Tersisa: ${foodItem.quantity} porsi` });
  }

  // Update quantity or remove if sold out
  foodItem.quantity -= claimQty;
  
  const claimCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

  const newClaim = {
    id: Date.now().toString(),
    foodId,
    foodTitle: foodItem.title,
    restaurantName: foodItem.restaurantName,
    userId,
    userName: userName || "Masyarakat",
    quantity: claimQty,
    claimCode,
    pricePaid: foodItem.discountPrice * claimQty,
    claimedAt: new Date().toISOString()
  };

  db.claims.push(newClaim);

  // Update Core Infra Metrics
  db.impact.totalPortionsServed += claimQty;
  db.impact.economicValueSavedRupiah += (foodItem.originalPrice - foodItem.discountPrice) * claimQty;

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: generateLogId(db.impact.safetyAuditLog),
    timestamp: new Date().toISOString(),
    partner: foodItem.restaurantName,
    action: `${userName || "Masyarakat"} mengklaim ${claimQty} porsi '${foodItem.title}' (Kode: ${claimCode})`,
    type: "Claim & Transfer"
  });

  // If sold out, remove from listing
  if (foodItem.quantity === 0) {
    db.foods.splice(foodIndex, 1);
  }

  res.json({
    success: true,
    message: 'Klaim berhasil disetujui',
    claim: newClaim
  });
});

module.exports = router;
