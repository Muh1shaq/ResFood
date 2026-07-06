const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Register route
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, password, name, role }])
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
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }

  try {
    // Find user by email and password
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
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
