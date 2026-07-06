const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper to map Supabase donation records to Frontend camelCase structure
const mapDonationItem = (d) => ({
  id: d.id.toString(),
  name: d.name,
  title: d.title,
  description: d.description,
  target: Number(d.target),
  current: Number(d.current),
  deadline: d.deadline,
  status: d.status,
  safetyProtocol: d.safety_protocol,
  volunteers: Array.isArray(d.volunteers) ? d.volunteers : (typeof d.volunteers === 'string' ? JSON.parse(d.volunteers) : []),
  createdAt: d.created_at
});

// Get all donation requests
router.get('/', async (req, res) => {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    res.json(donations.map(mapDonationItem));
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data permintaan donasi' });
  }
});

// Add new donation request (nonprofit)
router.post('/', async (req, res) => {
  const { title, name, description, target, deadline, safetyProtocol } = req.body;

  if (!title || !name || !target) {
    return res.status(400).json({ success: false, message: 'Judul, nama lembaga, dan target porsi wajib diisi' });
  }

  try {
    const safetyProtocolText = safetyProtocol || "Kemasan higienis bersertifikat, terbungkus rapat";
    const newDonationRow = {
      name,
      title,
      description: description || "Membutuhkan makanan surplus berkualitas baik untuk disalurkan ke penerima manfaat.",
      target: Number(target),
      current: 0,
      deadline: deadline || "3 hari lagi",
      status: "Berlangsung",
      safety_protocol: safetyProtocolText,
      volunteers: []
    };

    const { data: insertedDonation, error: insertError } = await supabase
      .from('donations')
      .insert([newDonationRow])
      .select()
      .single();

    if (insertError) throw insertError;

    // Add audit log
    await supabase
      .from('safety_audit_logs')
      .insert([{
        partner: name,
        action: `Permintaan donasi pangan '${title}' diajukan. Protokol keamanan: ${safetyProtocolText}`,
        type: "Redistribution Setup"
      }]);

    res.status(201).json({
      success: true,
      message: 'Permintaan donasi berhasil diajukan',
      donation: mapDonationItem(insertedDonation)
    });
  } catch (err) {
    console.error("Error creating donation request:", err);
    res.status(500).json({ success: false, message: 'Gagal mengajukan permintaan donasi' });
  }
});

// Donate/contribute food to a request
router.post('/:id/donate', async (req, res) => {
  const { id } = req.params;
  const { quantity, contributorName } = req.body;

  if (!quantity) {
    return res.status(400).json({ success: false, message: 'Jumlah porsi donasi wajib diisi' });
  }

  try {
    const { data: donation, error: getError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (getError) throw getError;

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Permintaan donasi tidak ditemukan' });
    }

    const qty = Number(quantity);
    const newCurrent = Number(donation.current) + qty;
    const newStatus = newCurrent >= Number(donation.target) ? "Selesai" : donation.status;

    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({
        current: newCurrent,
        status: newStatus
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update global metrics
    const { data: currentImpact, error: impactError } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('id', 'global_impact')
      .maybeSingle();

    if (impactError) throw impactError;

    const rescuedKg = Math.round(qty * 0.5);

    if (currentImpact) {
      await supabase
        .from('impact_metrics')
        .update({
          total_rescued_kg: Number(currentImpact.total_rescued_kg) + rescuedKg,
          total_portions_served: Number(currentImpact.total_portions_served) + qty
        })
        .eq('id', 'global_impact');
    }

    // Add audit log
    await supabase
      .from('safety_audit_logs')
      .insert([{
        partner: contributorName || "Donatur Anonim",
        action: `Menyumbangkan ${qty} porsi ke '${donation.title}' (Lembaga: ${donation.name})`,
        type: "Redistribution Flow"
      }]);

    res.json({
      success: true,
      message: 'Terima kasih atas donasi Anda!',
      donation: mapDonationItem(updatedDonation)
    });
  } catch (err) {
    console.error("Error donating:", err);
    res.status(500).json({ success: false, message: 'Gagal memproses donasi' });
  }
});

// Register courier/volunteer to a request
router.post('/:id/volunteer', async (req, res) => {
  const { id } = req.params;
  const { volunteerName, volunteerPhone } = req.body;

  if (!volunteerName || !volunteerPhone) {
    return res.status(400).json({ success: false, message: 'Nama dan nomor telepon relawan wajib diisi' });
  }

  try {
    const { data: donation, error: getError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (getError) throw getError;

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Permintaan donasi tidak ditemukan' });
    }

    let volunteerList = [];
    if (donation.volunteers) {
      volunteerList = Array.isArray(donation.volunteers)
        ? donation.volunteers
        : (typeof donation.volunteers === 'string' ? JSON.parse(donation.volunteers) : []);
    }

    const newVolunteer = {
      name: volunteerName,
      phone: volunteerPhone,
      registeredAt: new Date().toISOString()
    };

    volunteerList.push(newVolunteer);

    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({ volunteers: volunteerList })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Add audit log
    await supabase
      .from('safety_audit_logs')
      .insert([{
        partner: donation.name,
        action: `Relawan '${volunteerName}' bergabung untuk mendistribusikan donasi '${donation.title}'`,
        type: "Logistics Volunteer"
      }]);

    res.json({
      success: true,
      message: 'Pendaftaran relawan kurir berhasil! Terima kasih atas bantuan Anda.',
      donation: mapDonationItem(updatedDonation)
    });
  } catch (err) {
    console.error("Error signing up volunteer:", err);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan diri sebagai relawan' });
  }
});

module.exports = router;
