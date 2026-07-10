const express = require('express');
const router = express.Router();

// Helper: validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register route
router.post('/register', (req, res) => {
  const { email, password, name, role } = req.body;
  const db = req.db;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi' });
  }

  // Validate name length
  if (name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Nama minimal 2 karakter' });
  }

  // Validate email format
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ success: false, message: 'Format email tidak valid' });
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Kata sandi minimal 8 karakter' });
  }
  if (password.length > 20) {
    return res.status(400).json({ success: false, message: 'Kata sandi maksimal 20 karakter' });
  }

  // Validate role is allowed
  const allowedRoles = ['public', 'restaurant', 'nonprofit', 'courier'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Peran yang dipilih tidak valid' });
  }

  // Check for duplicate email (case-insensitive)
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar, silakan gunakan email lain' });
  }

  // Generate unique ID using timestamp to avoid collision
  const newUser = {
    id: Date.now().toString(),
    email: email.trim().toLowerCase(),
    password, // in real apps we hash this, keeping it simple for mock-up
    name: name.trim(),
    role
  };

  db.users.push(newUser);
  res.status(201).json({
    success: true,
    message: 'Pendaftaran berhasil',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi' });
  }

  // Validate email format
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ success: false, message: 'Format email tidak valid' });
  }

  // Match email case-insensitively, but password is case-sensitive (no trim on password)
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Email atau kata sandi salah' });
  }

  res.status(200).json({
    success: true,
    message: 'Login berhasil',
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

module.exports = router;
