const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { calculateDistance } = require('../utils/distance');

// ==========================================
// 1. Checkout (Validasi Jarak, Stok, Kurir)
// ==========================================
router.post('/checkout', async (req, res) => {
  const { foodId, quantity, userId, userName, userLat, userLng, userAddress } = req.body;

  if (!foodId || !quantity || !userId || !userLat || !userLng || !userAddress) {
    return res.status(400).json({ success: false, message: 'Data pesanan dan lokasi tidak lengkap' });
  }

  const claimQty = Number(quantity);
  if (isNaN(claimQty) || claimQty <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah pesanan tidak valid' });
  }

  try {
    // a. Validasi Stok Real-time
    const { data: foodItem, error: getError } = await supabase
      .from('foods')
      .select('*')
      .eq('id', foodId)
      .maybeSingle();

    if (getError) throw getError;
    if (!foodItem) return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });
    if (foodItem.quantity < claimQty) {
      return res.status(400).json({ success: false, message: `Stok tidak mencukupi. Sisa: ${foodItem.quantity}` });
    }

    // b. Validasi Jarak & Ongkir
    const distanceKm = calculateDistance(userLat, userLng, foodItem.latitude, foodItem.longitude);
    if (distanceKm > 10) {
      return res.status(400).json({ success: false, message: `Jarak terlalu jauh (${distanceKm.toFixed(1)} km). Maksimal 10km.` });
    }
    const deliveryFee = Math.ceil(distanceKm) * 2000;
    const foodPrice = foodItem.discount_price * claimQty;
    const totalPrice = foodPrice + deliveryFee;

    // c. Validasi Ketersediaan Kurir Terdekat
    const { data: activeDrivers, error: driverError } = await supabase
      .from('users')
      .select('id, name, current_lat, current_lng')
      .eq('role', 'courier')
      .eq('is_active', true);
      
    if (driverError) throw driverError;

    let nearestDriver = null;
    let minDriverDistance = Infinity;

    if (activeDrivers && activeDrivers.length > 0) {
      activeDrivers.forEach(driver => {
        if (driver.current_lat && driver.current_lng) {
          const dist = calculateDistance(foodItem.latitude, foodItem.longitude, driver.current_lat, driver.current_lng);
          if (dist < minDriverDistance) {
            minDriverDistance = dist;
            nearestDriver = driver;
          }
        }
      });
    }

    if (!nearestDriver) {
      return res.status(400).json({ success: false, message: 'Saat ini tidak ada kurir yang aktif di sekitar restoran.' });
    }

    // Generate PIN
    const pickupPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    const deliveryPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    const claimCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Potong stok real-time
    const updatedQty = foodItem.quantity - claimQty;
    if (updatedQty <= 0) {
      await supabase.from('foods').delete().eq('id', foodId);
    } else {
      await supabase.from('foods').update({ quantity: updatedQty }).eq('id', foodId);
    }

    // Buat record pesanan di tabel claims
    const newOrder = {
      food_id: foodId.toString(),
      food_title: foodItem.title,
      restaurant_name: foodItem.restaurant_name,
      user_id: userId.toString(),
      user_name: userName || "Pembeli",
      quantity: claimQty,
      claim_code: claimCode,
      price_paid: totalPrice,
      status: 'driver_assigned',
      driver_id: nearestDriver.id.toString(),
      pickup_pin: pickupPin,
      delivery_pin: deliveryPin,
      delivery_lat: userLat,
      delivery_lng: userLng,
      delivery_address: userAddress,
      delivery_fee: deliveryFee
    };

    const { data: insertedOrder, error: insertError } = await supabase
      .from('claims')
      .insert([newOrder])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      message: 'Pesanan berhasil dibuat dan kurir telah ditugaskan.',
      order: insertedOrder,
      distanceKm: distanceKm.toFixed(1)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memproses pesanan' });
  }
});

// ==========================================
// 2. Pickup (Validasi PIN di Restoran)
// ==========================================
router.post('/:id/pickup', async (req, res) => {
  const { id } = req.params;
  const { pickupPin } = req.body;

  if (!pickupPin) return res.status(400).json({ success: false, message: 'PIN Pengambilan diperlukan' });

  try {
    const { data: order, error: getError } = await supabase.from('claims').select('*').eq('id', id).maybeSingle();
    if (getError || !order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    if (order.pickup_pin !== pickupPin) {
      return res.status(400).json({ success: false, message: 'PIN Pengambilan tidak cocok. Makanan mungkin tertukar!' });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('claims')
      .update({ status: 'picked_up' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json({ success: true, message: 'Pesanan berhasil diambil oleh kurir', order: updatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memvalidasi pengambilan' });
  }
});

// ==========================================
// 3. Complete (Validasi PIN & GPS Pembeli)
// ==========================================
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { deliveryPin, driverLat, driverLng } = req.body;

  if (!deliveryPin || !driverLat || !driverLng) {
    return res.status(400).json({ success: false, message: 'PIN dan Lokasi GPS Kurir diperlukan' });
  }

  try {
    const { data: order, error: getError } = await supabase.from('claims').select('*').eq('id', id).maybeSingle();
    if (getError || !order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    // a. Validasi PIN Pembeli
    if (order.delivery_pin !== deliveryPin) {
      return res.status(400).json({ success: false, message: 'Kode PIN Penyelesaian salah. Pastikan pembeli yang menerimanya.' });
    }

    // b. Validasi Lokasi GPS
    const distKm = calculateDistance(driverLat, driverLng, order.delivery_lat, order.delivery_lng);
    const distMeters = distKm * 1000;
    
    // Toleransi jarak drop-off 150 meter
    if (distMeters > 150) {
      return res.status(400).json({ success: false, message: `GPS kurir terlalu jauh dari alamat (${Math.round(distMeters)}m). Anda harus berada dalam radius 150m.` });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('claims')
      .update({ status: 'delivered' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json({ success: true, message: 'Pesanan berhasil diselesaikan', order: updatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memvalidasi penyelesaian pesanan' });
  }
});

// GET Driver's assigned orders
router.get('/driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const { data, error } = await supabase.from('claims').select('*').eq('driver_id', driverId).in('status', ['driver_assigned', 'picked_up']);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pesanan kurir' });
  }
});

// GET user's orders
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase.from('claims').select('*').eq('user_id', userId).order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pesanan pengguna' });
  }
});

// GET restaurant's orders
router.get('/restaurant/:restaurantName', async (req, res) => {
  const { restaurantName } = req.params;
  try {
    const { data, error } = await supabase.from('claims').select('*').eq('restaurant_name', restaurantName).order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pesanan restoran' });
  }
});

module.exports = router;
