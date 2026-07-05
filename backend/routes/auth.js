const express = require('express');
const router = express.Router();

// Register route
router.post('/register', (req, res) => {
  const { email, password, name, role } = req.body;
  const db = req.db;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi' });
  }

  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
  }

  const newUser = {
    id: (db.users.length + 1).toString(),
    email,
    password, // in real apps we hash this, keeping it simple for mock-up
    name,
    role
  };

  db.users.push(newUser);
  res.status(201).json({ success: true, message: 'Pendaftaran berhasil', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }

  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }

  res.status(200).json({
    success: true,
    message: 'Login berhasil',
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

module.exports = router;
