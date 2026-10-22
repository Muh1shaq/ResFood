const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: require('crypto').randomUUID } : { v4: () => Math.random().toString(36).substring(2) + Date.now().toString(36) };
const supabase = require('../supabaseClient');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SCHEDULES_FILE = path.join(DATA_DIR, 'merchant_schedules.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Initial default schedule for Bakery Aroma Indah
const DEFAULT_SCHEDULES = [
  {
    id: 1,
    merchant_id: '1',
    session_name: 'Sesi Malam Surplus',
    open_time: '19:00:00',
    close_time: '21:00:00',
    active_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    is_active: true,
    auto_notify: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function readLocalJson(filePath, fallbackData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2));
      return fallbackData;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallbackData;
  }
}

function writeLocalJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ============================================================
// Schedules Repository
// ============================================================
async function getSchedulesByMerchant(merchantId) {
  try {
    const { data, error } = await supabase
      .from('merchant_schedules')
      .select('*')
      .eq('merchant_id', merchantId.toString())
      .order('id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
    if (error && error.code !== 'PGRST205') {
      console.warn("Supabase schedules query notice:", error.message);
    }
  } catch (err) {
    // fallback
  }

  // Fallback to local storage
  const localList = readLocalJson(SCHEDULES_FILE, DEFAULT_SCHEDULES);
  return localList.filter(s => s.merchant_id.toString() === merchantId.toString());
}

async function getAllActiveSchedules() {
  try {
    const { data, error } = await supabase
      .from('merchant_schedules')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  const localList = readLocalJson(SCHEDULES_FILE, DEFAULT_SCHEDULES);
  return localList.filter(s => s.is_active);
}

async function saveMerchantSchedule(merchantId, scheduleData) {
  const mId = merchantId.toString();
  const payload = {
    merchant_id: mId,
    session_name: scheduleData.sessionName || scheduleData.session_name || 'Sesi Surplus',
    open_time: scheduleData.openTime || scheduleData.open_time,
    close_time: scheduleData.closeTime || scheduleData.close_time,
    active_days: scheduleData.activeDays || scheduleData.active_days || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    is_active: scheduleData.isActive !== undefined ? scheduleData.isActive : true,
    auto_notify: scheduleData.autoNotify !== undefined ? scheduleData.autoNotify : true,
    updated_at: new Date().toISOString()
  };

  // 1. Try Supabase
  try {
    const { data: existing } = await supabase
      .from('merchant_schedules')
      .select('id')
      .eq('merchant_id', mId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('merchant_schedules')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (!error && data) return data;
    } else {
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('merchant_schedules')
        .insert([payload])
        .select()
        .single();
      if (!error && data) return data;
    }
  } catch (err) {
    // fallback to local
  }

  // 2. Local fallback
  const localList = readLocalJson(SCHEDULES_FILE, DEFAULT_SCHEDULES);
  const idx = localList.findIndex(s => s.merchant_id.toString() === mId);
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...payload };
    writeLocalJson(SCHEDULES_FILE, localList);
    return localList[idx];
  } else {
    const newItem = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...payload
    };
    localList.push(newItem);
    writeLocalJson(SCHEDULES_FILE, localList);
    return newItem;
  }
}

// ============================================================
// Notifications Repository (with Idempotency / session_key)
// ============================================================
async function getNotificationsByUser(userId) {
  const uId = userId.toString();
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  const localList = readLocalJson(NOTIFICATIONS_FILE, []);
  return localList
    .filter(n => n.user_id.toString() === uId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function createNotification(notif) {
  const uId = notif.userId || notif.user_id;
  const sessionKey = notif.sessionKey || notif.session_key;

  const newNotif = {
    id: uuidv4(),
    user_id: uId.toString(),
    role_target: notif.roleTarget || notif.role_target || 'konsumen',
    merchant_id: notif.merchantId ? notif.merchantId.toString() : null,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    is_read: false,
    session_key: sessionKey || null,
    data: notif.data || {},
    created_at: new Date().toISOString()
  };

  // Check idempotency in local file first if session_key is provided
  const localList = readLocalJson(NOTIFICATIONS_FILE, []);
  if (sessionKey) {
    const existsLocal = localList.some(n => n.session_key === sessionKey);
    if (existsLocal) {
      return null; // Already sent (idempotent)
    }
  }

  // 1. Try Supabase
  try {
    if (sessionKey) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('session_key', sessionKey)
        .maybeSingle();

      if (existing) {
        return null; // already sent in Supabase
      }
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([newNotif])
      .select()
      .single();

    if (!error && data) {
      // Also cache in localList for instant sync
      localList.unshift(data);
      writeLocalJson(NOTIFICATIONS_FILE, localList);
      return data;
    }
  } catch (err) {
    // fallback to local
  }

  // 2. Local fallback
  localList.unshift(newNotif);
  writeLocalJson(NOTIFICATIONS_FILE, localList);
  return newNotif;
}

async function markNotificationAsRead(id) {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  } catch (err) {
    // fallback
  }

  const localList = readLocalJson(NOTIFICATIONS_FILE, []);
  const item = localList.find(n => n.id.toString() === id.toString());
  if (item) {
    item.is_read = true;
    writeLocalJson(NOTIFICATIONS_FILE, localList);
  }
  return true;
}

async function markAllNotificationsAsRead(userId) {
  const uId = userId.toString();
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', uId);
  } catch (err) {
    // fallback
  }

  const localList = readLocalJson(NOTIFICATIONS_FILE, []);
  localList.forEach(n => {
    if (n.user_id.toString() === uId) {
      n.is_read = true;
    }
  });
  writeLocalJson(NOTIFICATIONS_FILE, localList);
  return true;
}

module.exports = {
  getSchedulesByMerchant,
  getAllActiveSchedules,
  saveMerchantSchedule,
  getNotificationsByUser,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
