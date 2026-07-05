const express = require('express');
const router = express.Router();

// Get all donation requests
router.get('/', (req, res) => {
  res.json(req.db.donations);
});

// Add new donation request (nonprofit)
router.post('/', (req, res) => {
  const { title, name, description, target, deadline, safetyProtocol } = req.body;
  const db = req.db;

  if (!title || !name || !target) {
    return res.status(400).json({ success: false, message: 'Judul, nama lembaga, dan target porsi wajib diisi' });
  }

  const newRequest = {
    id: (db.donations.length + 1).toString(),
    name,
    title,
    description: description || "Membutuhkan makanan surplus berkualitas baik untuk disalurkan ke penerima manfaat.",
    target: Number(target),
    current: 0,
    deadline: deadline || "3 hari lagi",
    status: "Berlangsung",
    safetyProtocol: safetyProtocol || "Kemasan higienis bersertifikat, terbungkus rapat",
    volunteers: []
  };

  db.donations.push(newRequest);

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: `LOG-00${db.impact.safetyAuditLog.length + 1}`,
    timestamp: new Date().toISOString(),
    partner: name,
    action: `Permintaan donasi pangan '${title}' diajukan. Protokol keamanan: ${newRequest.safetyProtocol}`,
    type: "Redistribution Setup"
  });

  res.status(201).json({ success: true, message: 'Permintaan donasi berhasil diajukan', donation: newRequest });
});

// Donate/contribute food to a request
router.post('/:id/donate', (req, res) => {
  const { id } = req.params;
  const { quantity, contributorName } = req.body;
  const db = req.db;

  if (!quantity) {
    return res.status(400).json({ success: false, message: 'Jumlah porsi donasi wajib diisi' });
  }

  const donation = db.donations.find(d => d.id === id);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Permintaan donasi tidak ditemukan' });
  }

  const qty = Number(quantity);
  donation.current += qty;
  if (donation.current >= donation.target) {
    donation.status = "Selesai";
  }

  // Update global metrics
  db.impact.totalRescuedKg += Math.round(qty * 0.5);
  db.impact.totalPortionsServed += qty;

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: `LOG-00${db.impact.safetyAuditLog.length + 1}`,
    timestamp: new Date().toISOString(),
    partner: contributorName || "Donatur Anonim",
    action: `Menyumbangkan ${qty} porsi ke '${donation.title}' (Lembaga: ${donation.name})`,
    type: "Redistribution Flow"
  });

  res.json({ success: true, message: 'Terima kasih atas donasi Anda!', donation });
});

// Register courier/volunteer to a request
router.post('/:id/volunteer', (req, res) => {
  const { id } = req.params;
  const { volunteerName, volunteerPhone } = req.body;
  const db = req.db;

  if (!volunteerName || !volunteerPhone) {
    return res.status(400).json({ success: false, message: 'Nama dan nomor telepon relawan wajib diisi' });
  }

  const donation = db.donations.find(d => d.id === id);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Permintaan donasi tidak ditemukan' });
  }

  const newVolunteer = {
    name: volunteerName,
    phone: volunteerPhone,
    registeredAt: new Date().toISOString()
  };

  donation.volunteers.push(newVolunteer);

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: `LOG-00${db.impact.safetyAuditLog.length + 1}`,
    timestamp: new Date().toISOString(),
    partner: donation.name,
    action: `Relawan '${volunteerName}' bergabung untuk mendistribusikan donasi '${donation.title}'`,
    type: "Logistics Volunteer"
  });

  res.json({ success: true, message: 'Pendaftaran relawan kurir berhasil! Terima kasih atas bantuan Anda.', donation });
});

module.exports = router;
