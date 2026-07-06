const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper to map Supabase audit log to frontend format
const mapAuditLog = (l) => ({
  id: `LOG-00${l.id}`,
  timestamp: l.timestamp,
  partner: l.partner,
  action: l.action,
  type: l.type
});

// Get core infrastructure logs & impact statistics
router.get('/', async (req, res) => {
  try {
    // 1. Get impact metrics
    const { data: impactData, error: metricsError } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('id', 'global_impact')
      .maybeSingle();

    if (metricsError) throw metricsError;

    // 2. Get safety audit logs
    const { data: logs, error: logsError } = await supabase
      .from('safety_audit_logs')
      .select('*')
      .order('id', { ascending: false });

    if (logsError) throw logsError;

    const result = {
      totalRescuedKg: impactData ? Number(impactData.total_rescued_kg) : 0,
      totalPortionsServed: impactData ? Number(impactData.total_portions_served) : 0,
      totalActivePartners: impactData ? Number(impactData.total_active_partners) : 0,
      co2ReducedKg: impactData ? Number(impactData.co2_reduced_kg) : 0,
      economicValueSavedRupiah: impactData ? Number(impactData.economic_value_saved_rupiah) : 0,
      safetyAuditLog: logs ? logs.map(mapAuditLog) : []
    };

    res.json(result);
  } catch (err) {
    console.error("Error fetching impact statistics:", err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data statistik dampak lingkungan' });
  }
});

// Post a new safety check audit log
router.post('/safety-log', async (req, res) => {
  const { partner, action } = req.body;

  if (!partner || !action) {
    return res.status(400).json({ success: false, message: 'Nama mitra dan tindakan audit kelayakan pangan wajib diisi' });
  }

  try {
    const newLog = {
      partner,
      action,
      type: "Safety Check"
    };

    const { data: insertedLog, error } = await supabase
      .from('safety_audit_logs')
      .insert([newLog])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Log kelayakan makanan berhasil dicatat',
      log: mapAuditLog(insertedLog)
    });
  } catch (err) {
    console.error("Error creating safety log:", err);
    res.status(500).json({ success: false, message: 'Gagal mencatat log kelayakan makanan' });
  }
});

module.exports = router;
