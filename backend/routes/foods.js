const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper to map Supabase food records to Frontend camelCase structure
const mapFoodItem = (f) => ({
  id: f.id.toString(),
  restaurantId: f.restaurant_id,
  restaurantName: f.restaurant_name,
  title: f.title,
  description: f.description,
  originalPrice: Number(f.original_price),
  discountPrice: Number(f.discount_price),
  quantity: Number(f.quantity),
  expiryTime: f.expiry_time,
  imageUrl: f.image_url,
  category: f.category,
  isHalal: f.is_halal,
  latitude: Number(f.latitude),
  longitude: Number(f.longitude),
  distance: Number(f.distance),
  type: f.type,
  safetyStatus: f.safety_status,
  createdAt: f.created_at
});

// Get all surplus foods
router.get('/', async (req, res) => {
  try {
    const { data: foods, error } = await supabase
      .from('foods')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    res.json(foods.map(mapFoodItem));
  } catch (err) {
    console.error("Error fetching foods:", err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data surplus makanan' });
  }
});

// Add new surplus food (restaurant dashboard)
router.post('/', async (req, res) => {
  const { title, category, price, originalPrice, quantity, expiryTime, restaurantId, restaurantName } = req.body;

  if (!title || !price || !quantity || !restaurantId) {
    return res.status(400).json({ success: false, message: 'Nama makanan, harga, dan jumlah wajib diisi' });
  }

  try {
    const safetyStatus = "Terverifikasi Aman (Suhu Ruang, < 3 Jam)";
    const newFoodRow = {
      restaurant_id: restaurantId,
      restaurant_name: restaurantName || "Mitra Restoran",
      title,
      description: req.body.description || `Surplus makanan segar kategori ${category} dari kami. Dijamin aman dan lezat.`,
      original_price: Number(originalPrice) || Number(price) * 2,
      discount_price: Number(price),
      quantity: Number(quantity),
      expiry_time: expiryTime || "Hari ini, 21:00 WIB",
      image_url: req.body.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
      category: category || "makanan berat",
      is_halal: req.body.isHalal !== undefined ? req.body.isHalal : true,
      latitude: req.body.latitude || -6.2100 + (Math.random() - 0.5) * 0.02,
      longitude: req.body.longitude || 106.8400 + (Math.random() - 0.5) * 0.02,
      distance: Math.round((0.5 + Math.random() * 2.5) * 10) / 10,
      type: "surplus",
      safety_status: safetyStatus
    };

    const { data: insertedFood, error: insertError } = await supabase
      .from('foods')
      .insert([newFoodRow])
      .select()
      .single();

    if (insertError) throw insertError;

    // Update Core Infrastructure Metrics
    const { data: currentImpact, error: impactError } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('id', 'global_impact')
      .maybeSingle();

    if (impactError) throw impactError;

    const co2Saved = Math.round(Number(quantity) * 2.5);
    const rescuedKg = Math.round(Number(quantity) * 0.5);

    if (currentImpact) {
      await supabase
        .from('impact_metrics')
        .update({
          co2_reduced_kg: Number(currentImpact.co2_reduced_kg) + co2Saved,
          total_rescued_kg: Number(currentImpact.total_rescued_kg) + rescuedKg
        })
        .eq('id', 'global_impact');
    }

    // Add audit log
    await supabase
      .from('safety_audit_logs')
      .insert([{
        partner: newFoodRow.restaurant_name,
        action: `Makanan baru '${newFoodRow.title}' ditambahkan dengan status safety: ${safetyStatus}`,
        type: "Safety Check"
      }]);

    res.status(201).json({ success: true, message: 'Surplus makanan berhasil dipasang', food: mapFoodItem(insertedFood) });
  } catch (err) {
    console.error("Error adding food:", err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan makanan surplus' });
  }
});

// Delete surplus food
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existingFood, error: checkError } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existingFood) {
      return res.status(404).json({ success: false, message: 'Makanan tidak ditemukan' });
    }

    const { error: deleteError } = await supabase
      .from('foods')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Makanan surplus berhasil dihapus' });
  } catch (err) {
    console.error("Error deleting food:", err);
    res.status(500).json({ success: false, message: 'Gagal menghapus makanan surplus' });
  }
});

// Claim food surplus (marketplace checkout)
router.post('/claim', async (req, res) => {
  const { foodId, quantity, userId, userName } = req.body;

  if (!foodId || !quantity || !userId) {
    return res.status(400).json({ success: false, message: 'ID Makanan, jumlah porsi, dan ID Pengguna wajib diisi' });
  }

  try {
    // Get food item details
    const { data: foodItem, error: getError } = await supabase
      .from('foods')
      .select('*')
      .eq('id', foodId)
      .maybeSingle();

    if (getError) throw getError;

    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Makanan surplus tidak ditemukan' });
    }

    const claimQty = Number(quantity);

    if (foodItem.quantity < claimQty) {
      return res.status(400).json({ success: false, message: `Stok tidak mencukupi (Tersisa: ${foodItem.quantity} porsi)` });
    }

    // Update quantity or remove if sold out
    const updatedQty = foodItem.quantity - claimQty;
    if (updatedQty <= 0) {
      const { error: deleteError } = await supabase
        .from('foods')
        .delete()
        .eq('id', foodId);
      if (deleteError) throw deleteError;
    } else {
      const { error: updateError } = await supabase
        .from('foods')
        .update({ quantity: updatedQty })
        .eq('id', foodId);
      if (updateError) throw updateError;
    }

    // Insert claim record
    const claimCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaimRow = {
      food_id: foodId.toString(),
      food_title: foodItem.title,
      restaurant_name: foodItem.restaurant_name,
      user_id: userId.toString(),
      user_name: userName || "Masyarakat",
      quantity: claimQty,
      claim_code: claimCode,
      price_paid: foodItem.discount_price * claimQty
    };

    const { data: insertedClaim, error: claimInsertError } = await supabase
      .from('claims')
      .insert([newClaimRow])
      .select()
      .single();

    if (claimInsertError) throw claimInsertError;

    // Update Core Infra Metrics
    const { data: currentImpact, error: impactError } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('id', 'global_impact')
      .maybeSingle();

    if (impactError) throw impactError;

    const econSaved = (Number(foodItem.original_price) - Number(foodItem.discount_price)) * claimQty;

    if (currentImpact) {
      await supabase
        .from('impact_metrics')
        .update({
          total_portions_served: Number(currentImpact.total_portions_served) + claimQty,
          economic_value_saved_rupiah: Number(currentImpact.economic_value_saved_rupiah) + econSaved
        })
        .eq('id', 'global_impact');
    }

    // Add audit log
    await supabase
      .from('safety_audit_logs')
      .insert([{
        partner: foodItem.restaurant_name,
        action: `${userName || "Masyarakat"} mengklaim ${claimQty} porsi '${foodItem.title}' (Kode: ${claimCode})`,
        type: "Claim & Transfer"
      }]);

    res.json({
      success: true,
      message: 'Klaim berhasil disetujui',
      claim: {
        id: insertedClaim.id.toString(),
        foodId: insertedClaim.food_id,
        foodTitle: insertedClaim.food_title,
        restaurantName: insertedClaim.restaurant_name,
        userId: insertedClaim.user_id,
        userName: insertedClaim.user_name,
        quantity: Number(insertedClaim.quantity),
        claimCode: insertedClaim.claim_code,
        pricePaid: Number(insertedClaim.price_paid),
        claimedAt: insertedClaim.claimed_at
      }
    });
  } catch (err) {
    console.error("Error in claim route:", err);
    res.status(500).json({ success: false, message: 'Gagal memproses klaim makanan surplus' });
  }
});

module.exports = router;
