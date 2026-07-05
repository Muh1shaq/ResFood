const express = require('express');
const router = express.Router();

// Get core infrastructure logs & impact statistics
router.get('/', (req, res) => {
  res.json(req.db.impact);
});

// Post a new safety check audit log
router.post('/safety-log', (req, res) => {
  const { partner, action } = req.body;
  const db = req.db;

  if (!partner || !action) {
    return res.status(400).json({ success: false, message: 'Nama mitra dan tindakan audit kelayakan pangan wajib diisi' });
  }

  const logId = `LOG-00${db.impact.safetyAuditLog.length + 1}`;
  const newLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    partner,
    action,
    type: "Safety Check"
  };

  db.impact.safetyAuditLog.unshift(newLog);

  res.status(201).json({ success: true, message: 'Log kelayakan makanan berhasil dicatat', log: newLog });
});

module.exports = router;
