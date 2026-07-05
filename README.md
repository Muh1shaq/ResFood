# ResFood Platform - Ekosistem Digital Penyelamat Surplus Pangan

**ResFood** adalah platform ekosistem digital berbasis web yang dirancang khusus untuk mengatasi isu rantai pasok makanan, pemborosan pangan (*food waste*), dan kerawanan pangan global secara real-time. Platform ini menjembatani produsen makanan yang memiliki kelebihan stok dengan konsumen akhir serta lembaga sosial/non-profit untuk pendistribusian makanan yang lebih aman dan terarah.

---

## 🚀 4 Pilar Fitur Utama

1. **Modul Manajemen Mitra**
   Fitur khusus bagi pelaku bisnis kuliner (restoran, hotel, bakery, dan swalayan) untuk mengelola stok makanan berlebih secara cepat dan efisien. Dilengkapi dengan dasbor analitik dampak karbon (CO2), pemulihan nilai ekonomi, serta sistem pelacakan Eco-Points.
   
2. **Surplus Food Marketplace**
   Disediakan untuk masyarakat umum dan pelaku UMKM kuliner yang ingin mendapatkan bahan baku atau makanan siap saji berkualitas tinggi dengan diskon hingga 70%. Terintegrasi dengan peta SVG koordinat geografis interaktif untuk deteksi makanan terdekat secara real-time.

3. **Smart Redistribution Network**
   Dirancang ramah bagi organisasi sosial, bank makanan (*food bank*), panti asuhan, dan relawan dalam mengelola logistik donasi pangan skala besar secara transparan dengan pelacakan persentase ketercapaian target donasi.

4. **Core Infrastructure**
   infrastruktur pendukung di balik layar untuk memastikan transparansi rantai pasok, audit kelayakan standar keamanan pangan (*safety checks*), dan pemantauan reduksi emisi karbon yang dihasilkan dari penyelamatan makanan surplus.

---

## 💻 Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan sistem Anda memenuhi prasyarat berikut:
* **Runtime**: [Node.js](https://nodejs.org/) (Versi 18.0.0 atau yang lebih baru)
* **Package Manager**: NPM (bawaan Node.js, Versi 9.0.0 atau lebih baru)
* **Browser**: Browser web modern apa saja (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, dll.)

---

## 🛠️ Petunjuk Instalasi dan Konfigurasi

Ikuti langkah-langkah di bawah ini untuk memasang dan menjalankan aplikasi ResFood di komputer lokal Anda:

1. **Masuk ke Direktori Proyek**:
   ```bash
   cd resfood-app
   ```

2. **Instal Dependensi Backend**:
   Masuk ke folder `backend` dan lakukan instalasi modul:
   ```bash
   cd backend
   npm install
   ```

3. **Jalankan Server Pengembang**:
   Jalankan perintah berikut untuk memulai server backend Express:
   ```bash
   npm start
   ```
   Server akan berjalan secara otomatis di port **5000** dengan alamat: **[http://localhost:5000](http://localhost:5000)**.

---

## 📖 Cara Penggunaan

Setelah server berhasil dijalankan, buka peramban Anda dan kunjungi **`http://localhost:5000`**. Anda dapat menggunakan akun simulasi yang telah kami sediakan untuk menguji berbagai peran berikut:

### A. Sebagai Mitra Kuliner (Restoran / Ritel)
* Masuk ke halaman **Portal Mitra / Dasbor** menggunakan akun:
  * **Email**: `mitra@resfood.com`
  * **Kata Sandi**: `password123`
* Anda dapat menggunakan panel formulir sebelah kiri untuk mendaftarkan surplus makanan baru Anda. Menu yang Anda pasang akan langsung live secara instan di Marketplace.
* Anda juga dapat memantau akumulasi Eco-Points serta total reduksi karbon CO2 dari usaha Anda.

### B. Sebagai Pembeli / UMKM (Marketplace)
* Kunjungi menu **Marketplace**. Gunakan mode **Peta Terdekat** untuk memvisualisasikan titik makanan secara geografis di sekitar kota Jakarta, atau mode **Daftar** untuk melihat secara detail.
* Anda dapat mencari makanan, memilih kategori (cth. Roti & Kue, Makanan Berat), dan mengklaim porsi surplus makanan.
* Setelah klaim berhasil, sistem akan memproduksi **Kode Klaim Pengambilan** unik (`RES-XXXX`) untuk ditunjukkan ke kasir toko saat pengambilan fisik.

### C. Sebagai Lembaga Sosial & Relawan (Smart Redistribution Network)
* Masuk menggunakan akun non-profit:
  * **Email**: `panti@resfood.com`
  * **Kata Sandi**: `password123`
* Lembaga sosial dapat mengajukan formulir permohonan bantuan pangan mentah atau matang yang mendesak.
* Masyarakat atau mitra dapat menyumbangkan makanan surplus berskala besar untuk memenuhi target porsi lembaga tersebut.
* Masyarakat juga dapat mendaftarkan diri sebagai **Kurir Relawan** untuk membantu mendistribusikan pasokan makanan ke lokasi panti asuhan/dapur umum target.

---

## 📄 Informasi Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Anda bebas menggunakan, mendistribusikan, dan memodifikasi proyek ini untuk kepentingan komersial maupun non-komersial selama menyertakan atribusi penulis asli. Silakan tinjau file lisensi terkait untuk informasi hukum selengkapnya.

---

## 👥 Kontribusi dan Kontak Pengembang

Kami sangat menyukai kontribusi dari komunitas! Jika Anda ingin membantu menyempurnakan platform ResFood, Anda dapat:
1. Melakukan *fork* repositori ini.
2. Membuat cabang (*branch*) fitur baru Anda: `git checkout -b fitur-keren-saya`.
3. Melakukan *commit* perubahan Anda: `git commit -m "Menambahkan fitur penyelamatan pangan baru"`.
4. Melakukan *push* ke cabang tersebut: `git push origin fitur-keren-saya`.
5. Mengirimkan *Pull Request* (PR) di GitHub.

### Hubungi Tim Pengembang
* **Email Dukungan & Kemitraan**: [info@resfood.com](mailto:info@resfood.com)
* **Hubungan Developer**: [dev@resfood.com](mailto:dev@resfood.com)
* **Telepon Hotline**: +62 (21) 1234-5678
* **Alamat Kantor**: Menara Rantai Pasok Hijau, DKI Jakarta, Indonesia.
