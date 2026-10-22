const express = require('express');
const router = express.Router();
const { 
  getNotificationsByUser, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  createNotification
} = require('../utils/storage');
const { checkSchedulesAndDispatchNotifications } = require('../utils/notificationScheduler');

// GET /api/notifications?user_id=...
router.get('/', async (req, res) => {
  const userId = req.query.user_id || req.query.userId;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });
  }

  try {
    const list = await getNotificationsByUser(userId);
    const unreadCount = list.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      data: list
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await markNotificationAsRead(id);
    res.json({ success: true, message: 'Notifikasi ditandai telah dibaca' });
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status notifikasi' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  const { userId, user_id } = req.body;
  const targetUser = userId || user_id;

  if (!targetUser) {
    return res.status(400).json({ success: false, message: 'user_id diperlukan' });
  }

  try {
    await markAllNotificationsAsRead(targetUser);
    res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca' });
  } catch (err) {
    console.error("Error marking all read:", err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi' });
  }
});

// POST /api/notifications/trigger-test
// Endpoint khusus pengujian/demo instan untuk memicu trigger 1, 2, atau 3
router.post('/trigger-test', async (req, res) => {
  const { scenario, targetUserId, merchantName } = req.body;

  try {
    if (scenario === 'PREP_REMINDER') {
      const notif = await createNotification({
        userId: targetUserId || '1',
        roleTarget: 'mitra',
        merchantId: '1',
        title: 'Pengingat Sesi Surplus: 15 Menit Lagi',
        message: `Halo ${merchantName || 'Bakery Aroma Indah'}, jam operasional surplus Anda akan dimulai 15 menit lagi. Pastikan stok surplus diperbarui dan checklist higienitas diverifikasi.`,
        type: 'PREP_REMINDER',
        data: { url: '/dashboard' }
      });
      return res.json({ success: true, message: 'Trigger PREP_REMINDER berhasil dijalankan', data: notif });
    }

    if (scenario === 'SURPLUS_OPEN') {
      const notif = await createNotification({
        userId: targetUserId || '3', // Budi Santoso / public
        roleTarget: 'konsumen',
        merchantId: '1',
        title: `Surplus Pangan Dibuka: ${merchantName || 'Bakery Aroma Indah'}`,
        message: `Sesi surplus di ${merchantName || 'Bakery Aroma Indah'} resmi dibuka (19:00 - 21:00 WIB) dengan diskon hingga 70%! Segera klaim sebelum kehabisan.`,
        type: 'SURPLUS_OPEN',
        data: { url: '/marketplace' }
      });

      // Juga kirim ke kurir
      const notifKurir = await createNotification({
        userId: '4', // Hendra Saputra (courier)
        roleTarget: 'kurir',
        merchantId: '1',
        title: `Mitra Membuka Sesi Surplus: ${merchantName || 'Bakery Aroma Indah'}`,
        message: `Mitra ${merchantName || 'Bakery Aroma Indah'} di area Anda telah membuka sesi surplus. Aktifkan status online untuk menerima order pengantaran!`,
        type: 'SURPLUS_OPEN',
        data: { url: '/dashboard' }
      });

      return res.json({ success: true, message: 'Trigger SURPLUS_OPEN berhasil dikirim ke Konsumen & Kurir', data: { notif, notifKurir } });
    }

    if (scenario === 'LAST_CALL') {
      const notif = await createNotification({
        userId: targetUserId || '3',
        roleTarget: 'konsumen',
        merchantId: '1',
        title: 'Last Call: Pesanan RES-9982 Belum Diambil',
        message: `Pesanan Donat & Muffin di ${merchantName || 'Bakery Aroma Indah'} belum diambil. Sesi operasional berakhir dalam 30 menit. Segera lakukan Self-Pickup!`,
        type: 'LAST_CALL',
        data: { url: '/marketplace' }
      });
      return res.json({ success: true, message: 'Trigger LAST_CALL berhasil dikirim', data: notif });
    }

    // Default: run regular scheduler check immediately
    const result = await checkSchedulesAndDispatchNotifications();
    res.json({ success: true, message: 'Pemeriksaan scheduler selesai dijalankan', result });
  } catch (err) {
    console.error("Error in trigger-test:", err);
    res.status(500).json({ success: false, message: 'Gagal memicu trigger pengujian' });
  }
});

module.exports = router;
