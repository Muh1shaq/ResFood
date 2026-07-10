const express = require('express');
const router = express.Router();

// Helper: generate sequential log ID safely
function generateLogId(logArray) {
  return `LOG-${String(logArray.length + 1).padStart(3, '0')}`;
}

// Helper: validate Indonesian phone number format
function isValidIndonesianPhone(phone) {
  // Accepts: 08xxxxxxxx or 628xxxxxxxx or +628xxxxxxxx
  return /^(\+62|62|0)8[0-9]{8,11}$/.test(phone.replace(/[\s\-]/g, ''));
}

// Get all donation requests
router.get('/', (req, res) => {
  res.json(req.db.donations);
});

// Add new donation request (nonprofit)
router.post('/', (req, res) => {
  const { title, name, description, target, deadline, safetyProtocol } = req.body;
  const db = req.db;

  if (!title || !name || !target) {
    return res.status(400).json({ success: false, message: 'Judul kebutuhan, nama lembaga, dan target porsi wajib diisi' });
  }

  // Validate name length
  if (name.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Nama lembaga minimal 3 karakter' });
  }

  // Validate title length
  if (title.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Judul kebutuhan minimal 5 karakter' });
  }

  const targetQty = Number(target);

  // Validate target is a positive integer
  if (isNaN(targetQty) || targetQty <= 0 || !Number.isInteger(targetQty)) {
    return res.status(400).json({ success: false, message: 'Target jumlah porsi harus berupa bilangan bulat positif' });
  }

  if (targetQty > 10000) {
    return res.status(400).json({ success: false, message: 'Target porsi tidak boleh lebih dari 10.000' });
  }

  const newRequest = {
    id: Date.now().toString(),
    name: name.trim(),
    title: title.trim(),
    description: description ? description.trim() : "Membutuhkan makanan surplus berkualitas baik untuk disalurkan ke penerima manfaat.",
    target: targetQty,
    current: 0,
    deadline: deadline ? deadline.trim() : "3 hari lagi",
    status: "Berlangsung",
    safetyProtocol: safetyProtocol ? safetyProtocol.trim() : "Kemasan higienis bersertifikat, terbungkus rapat",
    volunteers: []
  };

  db.donations.push(newRequest);

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: generateLogId(db.impact.safetyAuditLog),
    timestamp: new Date().toISOString(),
    partner: newRequest.name,
    action: `Permintaan donasi pangan '${newRequest.title}' diajukan. Protokol keamanan: ${newRequest.safetyProtocol}`,
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

  const qty = Number(quantity);

  // Validate quantity is a positive integer
  if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
    return res.status(400).json({ success: false, message: 'Jumlah donasi harus berupa bilangan bulat positif' });
  }

  const donation = db.donations.find(d => d.id === id);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Permintaan donasi tidak ditemukan' });
  }

  if (donation.status === 'Selesai') {
    return res.status(400).json({ success: false, message: 'Permintaan donasi ini sudah selesai / target terpenuhi' });
  }

  donation.current += qty;
  if (donation.current >= donation.target) {
    donation.current = donation.target; // Cap at target, don't overflow
    donation.status = "Selesai";
  }

  // Update global metrics
  db.impact.totalRescuedKg += Math.round(qty * 0.5);
  db.impact.totalPortionsServed += qty;

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: generateLogId(db.impact.safetyAuditLog),
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

  // Validate volunteer name length
  if (volunteerName.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Nama relawan minimal 2 karakter' });
  }

  // Validate Indonesian phone number format
  if (!isValidIndonesianPhone(volunteerPhone)) {
    return res.status(400).json({ success: false, message: 'Format nomor WhatsApp tidak valid. Gunakan format: 08XXXXXXXXXX atau +628XXXXXXXXXX' });
  }

  const donation = db.donations.find(d => d.id === id);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Permintaan donasi tidak ditemukan' });
  }

  const newVolunteer = {
    name: volunteerName.trim(),
    phone: volunteerPhone.trim(),
    registeredAt: new Date().toISOString()
  };

  donation.volunteers.push(newVolunteer);

  // Add audit log
  db.impact.safetyAuditLog.unshift({
    id: generateLogId(db.impact.safetyAuditLog),
    timestamp: new Date().toISOString(),
    partner: donation.name,
    action: `Relawan '${volunteerName.trim()}' bergabung untuk mendistribusikan donasi '${donation.title}'`,
    type: "Logistics Volunteer"
  });

  res.json({ success: true, message: 'Pendaftaran relawan kurir berhasil! Kami akan segera menghubungi Anda.', donation });
});

module.exports = router;
