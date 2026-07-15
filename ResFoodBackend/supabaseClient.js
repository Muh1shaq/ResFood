const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '../database.env'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      const val = valueParts.join('=').trim();
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  }
} catch (err) {
  console.error("Error reading database.env:", err);
}

// Clean trailing '/rest/v1/' or '/rest/v1' from URL if present
if (supabaseUrl) {
  if (supabaseUrl.endsWith('/rest/v1/')) {
    supabaseUrl = supabaseUrl.slice(0, -'/rest/v1/'.length);
  } else if (supabaseUrl.endsWith('/rest/v1')) {
    supabaseUrl = supabaseUrl.slice(0, -'/rest/v1'.length);
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Supabase credentials not found in database.env!");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
