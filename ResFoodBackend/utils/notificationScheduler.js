const supabase = require('../supabaseClient');
const { calculateDistance } = require('./distance');
const { getAllActiveSchedules, createNotification } = require('./storage');

// Days mapping in Indonesian
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Helper to convert "HH:mm" or "HH:mm:ss" to total minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return -1;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

// Format Date to YYYY-MM-DD
function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Main Scheduler Check
 * @param {Date} [simulatedDate] Optional simulated Date object for dev testing
 */
async function checkSchedulesAndDispatchNotifications(simulatedDate) {
  const now = simulatedDate || new Date();
  const todayName = DAYS_ID[now.getDay()];
  const todayStr = getLocalDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  try {
    const schedules = await getAllActiveSchedules();
    if (!schedules || schedules.length === 0) return { checked: 0, dispatched: 0 };

    let dispatchedCount = 0;

    // Fetch active users and foods to optimize checks
    const { data: allUsers } = await supabase.from('users').select('*');
    const userList = allUsers || [];

    const { data: allFoods } = await supabase.from('foods').select('*');
    const foodList = allFoods || [];

    const { data: allClaims } = await supabase.from('claims').select('*');
    const claimList = allClaims || [];

    for (const sched of schedules) {
      // Check if schedule is active on today's day of week
      const activeDays = Array.isArray(sched.active_days) ? sched.active_days : [];
      if (activeDays.length > 0 && !activeDays.includes(todayName)) {
        continue;
      }

      const openMin = timeToMinutes(sched.open_time);
      const closeMin = timeToMinutes(sched.close_time);
      if (openMin === -1 || closeMin === -1) continue;

      const merchantUser = userList.find(u => u.id.toString() === sched.merchant_id.toString());
      const merchantName = merchantUser ? merchantUser.name : 'Mitra ResFood';

      // ==============================================================
      // Trigger 1: Pengingat Persiapan ke Mitra (15 Menit Sebelum open_time)
      // ==============================================================
      const prepWindow = openMin - 15;
      if (currentMinutes >= prepWindow && currentMinutes < openMin) {
        const sessionKey = `${sched.merchant_id}_${todayStr}_${sched.open_time}_PREP_REMINDER_${sched.merchant_id}`;
        const notif = await createNotification({
          userId: sched.merchant_id,
          roleTarget: 'mitra',
          merchantId: sched.merchant_id,
          title: `Pengingat Sesi Surplus: 15 Menit Lagi`,
          message: `Halo ${merchantName}, jam operasional surplus [${sched.session_name}] akan dimulai pada pukul ${sched.open_time.slice(0, 5)} WIB. Pastikan stok makanan surplus diunggah dan checklist higienitas diverifikasi.`,
          type: 'PREP_REMINDER',
          sessionKey,
          data: {
            scheduleId: sched.id,
            openTime: sched.open_time,
            closeTime: sched.close_time,
            url: '/dashboard'
          }
        });
        if (notif) dispatchedCount++;
      }

      // ==============================================================
      // Trigger 2: Notifikasi Jam Operasional Dibuka (Tepat saat open_time s.d open_time + 10m)
      // Syarat: Mitra memiliki minimal 1 produk surplus aktif yang siap diklaim (quantity > 0)
      // ==============================================================
      if (currentMinutes >= openMin && currentMinutes < openMin + 15) {
        // Cek stok makanan aktif mitra
        const merchantFoods = foodList.filter(f => 
          f.restaurant_id.toString() === sched.merchant_id.toString() &&
          Number(f.quantity) > 0
        );

        if (merchantFoods.length > 0 && sched.auto_notify) {
          // Cari koordinat mitra (dari makanan atau data user)
          const refFood = merchantFoods[0];
          const mLat = Number(refFood.latitude) || (merchantUser ? Number(merchantUser.current_lat) : -6.2100);
          const mLng = Number(refFood.longitude) || (merchantUser ? Number(merchantUser.current_lng) : 106.8400);

          // Target A: Pembeli / Konsumen dalam radius 10 km
          const nearbyConsumers = userList.filter(u => {
            if (u.role !== 'public' && u.role !== 'customer') return false;
            if (!u.current_lat || !u.current_lng) return true; // Default broadcast jika user belum aktifkan gps
            const dist = calculateDistance(mLat, mLng, Number(u.current_lat), Number(u.current_lng));
            return dist <= 10;
          });

          for (const consumer of nearbyConsumers) {
            const sessionKey = `${sched.merchant_id}_${todayStr}_${sched.open_time}_SURPLUS_OPEN_${consumer.id}`;
            const notif = await createNotification({
              userId: consumer.id,
              roleTarget: 'konsumen',
              merchantId: sched.merchant_id,
              title: `Surplus Dibuka: ${merchantName}`,
              message: `Sesi surplus di ${merchantName} resmi dibuka (${sched.open_time.slice(0, 5)} - ${sched.close_time.slice(0, 5)} WIB)! Dapatkan makanan lezat diskon hingga 70%.`,
              type: 'SURPLUS_OPEN',
              sessionKey,
              data: {
                merchantId: sched.merchant_id,
                merchantName,
                totalItems: merchantFoods.length,
                url: '/marketplace'
              }
            });
            if (notif) dispatchedCount++;
          }

          // Target B: Kurir dalam radius 10 km (ResFoodKurir)
          const nearbyCouriers = userList.filter(u => {
            if (u.role !== 'courier') return false;
            if (!u.current_lat || !u.current_lng) return true;
            const dist = calculateDistance(mLat, mLng, Number(u.current_lat), Number(u.current_lng));
            return dist <= 10;
          });

          for (const courier of nearbyCouriers) {
            const sessionKey = `${sched.merchant_id}_${todayStr}_${sched.open_time}_SURPLUS_OPEN_${courier.id}`;
            const notif = await createNotification({
              userId: courier.id,
              roleTarget: 'kurir',
              merchantId: sched.merchant_id,
              title: `Mitra Buka Sesi Surplus: ${merchantName}`,
              message: `Mitra ${merchantName} telah membuka sesi surplus. Aktifkan status online di ResFoodKurir untuk bersiap menerima order pengantaran!`,
              type: 'SURPLUS_OPEN',
              sessionKey,
              data: {
                merchantId: sched.merchant_id,
                merchantName,
                url: '/dashboard'
              }
            });
            if (notif) dispatchedCount++;
          }
        }
      }

      // ==============================================================
      // Trigger 3: Peringatan Penutupan / Last Call (30 Menit Sebelum close_time)
      // Target A: Pembeli yang memiliki claim pending belum diambil
      // Target B: Mitra
      // ==============================================================
      const lastCallMin = closeMin - 30;
      if (currentMinutes >= lastCallMin && currentMinutes < closeMin) {
        // Target A: Pembeli dengan klaim pending pada mitra ini
        const pendingClaims = claimList.filter(c =>
          c.restaurant_name === merchantName &&
          (c.status === 'pending' || c.status === 'unclaimed')
        );

        for (const claim of pendingClaims) {
          const sessionKey = `${sched.merchant_id}_${todayStr}_${sched.close_time}_LAST_CALL_${claim.user_id}_${claim.id}`;
          const notif = await createNotification({
            userId: claim.user_id,
            roleTarget: 'konsumen',
            merchantId: sched.merchant_id,
            title: `Pengingat Ambil Pesanan: ${claim.claim_code}`,
            message: `Pesanan ${claim.food_title} (${claim.claim_code}) di ${merchantName} belum diambil. Sesi operasional berakhir dalam 30 menit (${sched.close_time.slice(0, 5)} WIB). Segera lakukan Self-Pickup!`,
            type: 'LAST_CALL',
            sessionKey,
            data: {
              claimId: claim.id,
              claimCode: claim.claim_code,
              closeTime: sched.close_time,
              url: '/marketplace'
            }
          });
          if (notif) dispatchedCount++;
        }

        // Target B: Mitra pengingat last call
        const sessionKeyMitra = `${sched.merchant_id}_${todayStr}_${sched.close_time}_LAST_CALL_${sched.merchant_id}`;
        const notifMitra = await createNotification({
          userId: sched.merchant_id,
          roleTarget: 'mitra',
          merchantId: sched.merchant_id,
          title: `Last Call: 30 Menit Menuju Penutupan`,
          message: `Sesi surplus [${sched.session_name}] akan ditutup dalam 30 menit (${sched.close_time.slice(0, 5)} WIB). Mohon siapkan paket pesanan untuk penukaran terakhir.`,
          type: 'LAST_CALL',
          sessionKey: sessionKeyMitra,
          data: {
            scheduleId: sched.id,
            closeTime: sched.close_time,
            url: '/dashboard'
          }
        });
        if (notifMitra) dispatchedCount++;
      }
    }

    return { checked: schedules.length, dispatched: dispatchedCount };
  } catch (err) {
    console.error("Error in notification scheduler:", err);
    return { checked: 0, dispatched: 0, error: err.message };
  }
}

/**
 * Start Background Scheduler
 * Runs every 60 seconds with Node.js native setInterval
 */
let schedulerInterval = null;
function startScheduler() {
  if (schedulerInterval) return;

  console.log("⏱️  ResFood Background Notification Scheduler started (running every 60s)");
  
  // Run once immediately on start
  checkSchedulesAndDispatchNotifications();

  // Run every 60 seconds
  schedulerInterval = setInterval(() => {
    checkSchedulesAndDispatchNotifications();
  }, 60000);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  checkSchedulesAndDispatchNotifications
};
