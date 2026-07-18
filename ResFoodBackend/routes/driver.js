const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ==========================================
// 1. Update Driver Status (Active/Inactive)
// ==========================================
router.post('/status', async (req, res) => {
  const { driverId, isActive } = req.body;

  if (!driverId || typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Driver ID dan status diperlukan' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', driverId)
      .eq('role', 'courier')
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Status berhasil diubah menjadi ${isActive ? 'Aktif' : 'Tidak Aktif'}`, driver: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status kurir' });
  }
});

// ==========================================
// 2. Real-time GPS Location Update
// ==========================================
router.post('/location', async (req, res) => {
  const { driverId, currentLat, currentLng } = req.body;

  if (!driverId || currentLat == null || currentLng == null) {
    return res.status(400).json({ success: false, message: 'Driver ID, Latitude, dan Longitude diperlukan' });
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ current_lat: currentLat, current_lng: currentLng })
      .eq('id', driverId)
      .eq('role', 'courier');

    if (error) throw error;
    res.json({ success: true, message: 'Lokasi berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui lokasi kurir' });
  }
});

module.exports = router;
