const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper: validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register route
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

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

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar, silakan gunakan email lain' });
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email: email.trim().toLowerCase(), password, name: name.trim(), role }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Error in register route:", err);
    res.status(500).json({ success: false, message: 'Gagal melakukan pendaftaran' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi' });
  }

  // Validate email format
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ success: false, message: 'Format email tidak valid' });
  }

  try {
    // Find user by email and password
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('password', password)
      .maybeSingle();

    if (loginError) throw loginError;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error in login route:", err);
    res.status(500).json({ success: false, message: 'Gagal memproses login' });
  }
});

module.exports = router;
