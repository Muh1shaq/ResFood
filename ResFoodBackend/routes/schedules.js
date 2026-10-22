const express = require('express');
const router = express.Router();
const { getSchedulesByMerchant, saveMerchantSchedule } = require('../utils/storage');

// Helper to convert "HH:mm" or "HH:mm:ss" to total minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return -1;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

// GET /api/merchants/:id/schedule
router.get('/:id/schedule', async (req, res) => {
  const { id } = req.params;
  try {
    const schedules = await getSchedulesByMerchant(id);
    if (!schedules || schedules.length === 0) {
      // Return default template if none configured yet
      return res.json({
        success: true,
        data: {
          merchant_id: id,
          session_name: 'Sesi Surplus Utama',
          open_time: '19:00:00',
          close_time: '21:00:00',
          active_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
          is_active: true,
          auto_notify: true
        }
      });
    }

    res.json({ success: true, data: schedules[0], allSessions: schedules });
  } catch (err) {
    console.error("Error fetching merchant schedule:", err);
    res.status(500).json({ success: false, message: 'Gagal memuat jadwal operasional mitra' });
  }
});

// PUT /api/merchants/:id/schedule
router.put('/:id/schedule', async (req, res) => {
  const { id } = req.params;
  const { openTime, closeTime, open_time, close_time, activeDays, active_days, sessionName, session_name, isActive, is_active, autoNotify, auto_notify } = req.body;

  const start = openTime || open_time;
  const end = closeTime || close_time;

  if (!start || !end) {
    return res.status(400).json({ success: false, message: 'Jam buka (open_time) dan jam tutup (close_time) wajib diisi' });
  }

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  if (startMin >= endMin) {
    return res.status(400).json({ success: false, message: 'Jam tutup harus lebih besar daripada jam buka' });
  }

  try {
    const updated = await saveMerchantSchedule(id, {
      openTime: start.length === 5 ? `${start}:00` : start,
      closeTime: end.length === 5 ? `${end}:00` : end,
      sessionName: sessionName || session_name || 'Sesi Surplus',
      activeDays: activeDays || active_days,
      isActive: isActive !== undefined ? isActive : (is_active !== undefined ? is_active : true),
      autoNotify: autoNotify !== undefined ? autoNotify : (auto_notify !== undefined ? auto_notify : true)
    });

    res.json({
      success: true,
      message: 'Jadwal operasional berhasil disimpan',
      data: updated
    });
  } catch (err) {
    console.error("Error updating merchant schedule:", err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan jadwal operasional mitra' });
  }
});

module.exports = router;
