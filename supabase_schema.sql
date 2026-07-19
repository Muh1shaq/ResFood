-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  current_lat NUMERIC,
  current_lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create foods table
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price NUMERIC NOT NULL,
  discount_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  expiry_time TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  is_halal BOOLEAN DEFAULT TRUE,
  latitude NUMERIC,
  longitude NUMERIC,
  distance NUMERIC,
  type TEXT DEFAULT 'surplus',
  safety_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  deadline TEXT NOT NULL,
  status TEXT DEFAULT 'Berlangsung',
  safety_protocol TEXT,
  volunteers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  food_id TEXT NOT NULL,
  food_title TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  claim_code TEXT NOT NULL,
  price_paid NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  driver_id TEXT,
  pickup_pin TEXT,
  delivery_pin TEXT,
  delivery_lat NUMERIC,
  delivery_lng NUMERIC,
  delivery_address TEXT,
  delivery_fee NUMERIC DEFAULT 0,
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create impact_metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
  id TEXT PRIMARY KEY DEFAULT 'global_impact',
  total_rescued_kg NUMERIC NOT NULL DEFAULT 0,
  total_portions_served NUMERIC NOT NULL DEFAULT 0,
  total_active_partners NUMERIC NOT NULL DEFAULT 0,
  co2_reduced_kg NUMERIC NOT NULL DEFAULT 0,
  economic_value_saved_rupiah NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create safety_audit_logs table
CREATE TABLE IF NOT EXISTS safety_audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  partner TEXT NOT NULL,
  action TEXT NOT NULL,
  type TEXT NOT NULL
);

-- Create merchant_validations table
CREATE TABLE IF NOT EXISTS merchant_validations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  nik TEXT,
  ktp_verified BOOLEAN DEFAULT FALSE,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  bank_verified BOOLEAN DEFAULT FALSE,
  outlet_address TEXT,
  outlet_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial data for users
INSERT INTO users (email, password, name, role) VALUES
('mitra@resfood.com', 'password123', 'Bakery Aroma Indah', 'restaurant'),
('panti@resfood.com', 'password123', 'Panti Asuhan Kasih Bunda', 'nonprofit'),
('budi@resfood.com', 'password123', 'Budi Santoso', 'public'),
('relawan@resfood.com', 'password123', 'Hendra Saputra', 'courier')
ON CONFLICT (email) DO NOTHING;

-- Seed initial data for impact_metrics
INSERT INTO impact_metrics (id, total_rescued_kg, total_portions_served, total_active_partners, co2_reduced_kg, economic_value_saved_rupiah)
VALUES ('global_impact', 25480, 18240, 142, 63700, 372000000)
ON CONFLICT (id) DO NOTHING;

-- Seed initial data for safety_audit_logs
INSERT INTO safety_audit_logs (partner, action, type) VALUES
('Bakery Aroma Indah', 'Suhu makanan diverifikasi 24°C - Layak Konsumsi', 'Safety Check'),
('Warung Sederhana Bu Joko', 'Nasi Rames Rendang diverifikasi uji visual & bau - Layak Konsumsi', 'Safety Check'),
('Supermarket Segar Abadi', 'Sortir buah apel & jeruk - Kadar gula & kelayakan fisik baik', 'Safety Check');

-- Seed initial data for foods
INSERT INTO foods (restaurant_id, restaurant_name, title, description, original_price, discount_price, quantity, expiry_time, image_url, category, is_halal, latitude, longitude, distance, type, safety_status) VALUES
('1', 'Bakery Aroma Indah', 'Donat & Muffin Aneka Rasa (Satu Kotak)', 'Satu kotak berisi 6 donat campuran rasa cokelat, keju, dan stroberi. Masih sangat empuk dan diproduksi pagi ini.', 60000, 20000, 4, 'Hari ini, 22:00 WIB', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80', 'roti & kue', true, -6.2100, 106.8400, 0.8, 'surplus', 'Terverifikasi Aman (Suhu Ruang, < 4 Jam)'),
('1', 'Warung Sederhana Bu Joko', 'Nasi Rames Rendang Lengkap', 'Nasi rames dengan lauk utama rendang sapi, sayur nangka, sambal ijo, dan daun singkong. Makanan surplus makan siang yang belum tersentuh.', 35000, 12000, 2, 'Hari ini, 17:00 WIB', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80', 'makanan berat', true, -6.2050, 106.8500, 1.5, 'surplus', 'Terverifikasi Aman (Suhu Ruang, < 2 Jam)'),
('5', 'Supermarket Segar Abadi', 'Keranjang Buah Musiman (Apel & Jeruk)', 'Keranjang buah berisi buah segar dengan sedikit cacat kulit luar namun bagian dalam masih sangat manis dan baik dikonsumsi.', 45000, 15000, 6, 'Besok, 12:00 WIB', 'https://images.unsplash.com/photo-1610832958506-ee56336191d1?w=400&q=80', 'buah & sayur', true, -6.2150, 106.8450, 2.1, 'surplus', 'Terverifikasi Segar (Uji Fisik & Organoleptik)');

-- Seed initial data for donations
INSERT INTO donations (name, title, description, target, current, deadline, status, safety_protocol) VALUES
('Panti Asuhan Kasih Bunda', 'Kebutuhan Roti & Susu Balita', 'Mencari surplus makanan dari bakery atau swalayan berupa roti tawar, kue basah, dan susu balita untuk santapan sore adik-adik panti.', 50, 32, 'Hari ini, 18:00 WIB', 'Berlangsung', 'Suhu Dingin & Kemasan Segel'),
('Dapur Umum Kelompok Relawan Ciliwung', 'Bahan Makanan Mentah (Sayuran & Protein)', 'Membutuhkan bahan mentah segar seperti sisa sortiran buah/sayur layak konsumsi dari swalayan atau perkebunan untuk diolah menjadi makanan siap saji warga terdampak banjir.', 100, 45, 'Besok, 10:00 WIB', 'Berlangsung', 'Uji Kualitas Bahan Mentah Layak Olah');
