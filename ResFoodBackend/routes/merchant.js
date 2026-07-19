const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ==========================================
// 1. Onboarding / Register Initial Account
// ==========================================
router.post('/onboarding', async (req, res) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name || !phone) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  try {
    // Register the user first (role: restaurant)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email: email.toLowerCase(), password, name, role: 'restaurant', is_active: false }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Create the merchant validation row
    const { error: validationError } = await supabase
      .from('merchant_validations')
      .insert([{ user_id: newUser.id.toString(), phone_number: phone }]);
      
    if (validationError) throw validationError;

    res.status(201).json({ success: true, message: 'Akun berhasil dibuat. Lanjut ke verifikasi OTP.', user: newUser });
  } catch (err) {
    console.error("Error onboarding:", err);
    res.status(500).json({ success: false, message: 'Gagal membuat akun restoran. Mungkin email sudah terdaftar.' });
  }
});

// ==========================================
// 2. Request OTP
// ==========================================
router.post('/request-otp', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'ID User diperlukan' });

  // In a real app, integrate with Twilio / email service here.
  // We mock the OTP to always be '123456'
  res.json({ success: true, message: 'OTP telah dikirim ke nomor HP/Email Anda (Mock: 123456)', mockOtp: '123456' });
});

// ==========================================
// 3. Verify OTP
// ==========================================
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ success: false, message: 'OTP diperlukan' });

  if (otp !== '123456') {
    return res.status(400).json({ success: false, message: 'Kode OTP salah' });
  }

  try {
    await supabase.from('merchant_validations')
      .update({ phone_verified: true, email_verified: true })
      .eq('user_id', userId);
    
    res.json({ success: true, message: 'Verifikasi OTP berhasil' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memverifikasi OTP' });
  }
});

// ==========================================
// 4. Verify KTP (Mock Dukcapil)
// ==========================================
router.post('/verify-ktp', async (req, res) => {
  const { userId, nik, ktpName } = req.body;
  
  if (!userId || !nik || !ktpName) {
    return res.status(400).json({ success: false, message: 'NIK dan Nama KTP diperlukan' });
  }

  // Mock Dukcapil rule: NIK must be exactly 16 digits
  const nikRegex = /^\d{16}$/;
  if (!nikRegex.test(nik)) {
    return res.status(400).json({ success: false, message: 'Validasi Gagal: NIK tidak ditemukan di database Dukcapil. Pastikan NIK berisi 16 digit angka.' });
  }

  try {
    await supabase.from('merchant_validations')
      .update({ nik: nik, ktp_verified: true })
      .eq('user_id', userId);
    
    res.json({ success: true, message: 'Validasi KTP berhasil. Identitas diverifikasi oleh sistem.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ==========================================
// 5. Verify Bank Account
// ==========================================
router.post('/verify-bank', async (req, res) => {
  const { userId, bankName, bankAccount, bankAccountName, ktpName } = req.body;

  if (!userId || !bankName || !bankAccount || !bankAccountName) {
    return res.status(400).json({ success: false, message: 'Data bank tidak lengkap' });
  }

  // Mock Bank Validation: Bank account name must loosely match KTP name
  // For demo, we just ensure it's not wildly different, or we just pass it if it contains part of the name
  if (ktpName && !bankAccountName.toLowerCase().includes(ktpName.toLowerCase().split(' ')[0])) {
     return res.status(400).json({ success: false, message: 'Nama pemilik rekening berbeda dengan identitas KTP. Harap lampirkan surat kuasa (Simulasi: nama harus mirip).' });
  }

  try {
    await supabase.from('merchant_validations')
      .update({
        bank_name: bankName,
        bank_account_number: bankAccount,
        bank_account_name: bankAccountName,
        bank_verified: true
      })
      .eq('user_id', userId);
    
    res.json({ success: true, message: 'Validasi rekening bank berhasil.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ==========================================
// 6. Submit Review (Outlet)
// ==========================================
router.post('/submit-review', async (req, res) => {
  const { userId, address } = req.body;

  if (!userId || !address) {
    return res.status(400).json({ success: false, message: 'Alamat outlet wajib diisi' });
  }

  try {
    // For demo purposes, we will auto-approve it, but in real life it sets to 'under_review'
    await supabase.from('merchant_validations')
      .update({
        outlet_address: address,
        verification_status: 'approved',
        outlet_verified: true
      })
      .eq('user_id', userId);
      
    // Activate the user account so they can login immediately in demo
    await supabase.from('users').update({ is_active: true }).eq('id', userId);
    
    res.json({ success: true, message: 'Pendaftaran selesai! Restoran Anda telah diverifikasi dan aktif.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
