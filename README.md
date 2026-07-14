# ResFood Platform - Ekosistem Digital Penyelamat Surplus Pangan

**ResFood** hadir sebagai solusi teknologi inovatif berbentuk aplikasi web untuk menangani permasalahan pemborosan makanan (*food waste*) sekaligus membantu ketahanan pangan. Melalui platform ini, produsen makanan dapat secara langsung menyalurkan surplus makanan mereka kepada masyarakat luas, UMKM, dan berbagai lembaga sosial dengan cara yang transparan, aman, dan berkelanjutan.

---

## 🚀 4 Pilar Fitur Utama

1. **Modul Manajemen Mitra**
   Sistem terpadu yang dirancang khusus bagi para pelaku industri makanan (seperti restoran, kafe, supermarket, dan perhotelan) untuk mengatur distribusi stok berlebih mereka. Panel ini juga menyajikan data analitik mengenai pengurangan jejak karbon, konversi nilai ekonomi yang diselamatkan, dan pencatatan riwayat *Eco-Points*.
   
2. **Surplus Food Marketplace**
   Pasar digital yang menghubungkan konsumen perorangan maupun pengusaha kecil dengan makanan berlebih berkualitas prima yang ditawarkan dengan potongan harga signifikan (hingga 70%). Modul ini didukung oleh integrasi peta interaktif untuk mempermudah pencarian lokasi makanan terdekat secara akurat.

3. **Smart Redistribution Network**
   Jaringan pintar yang memfasilitasi distribusi bantuan makanan ke panti asuhan, bank makanan, maupun komunitas sosial lainnya. Sistem ini menghadirkan transparansi penuh dari awal donasi hingga makanan diterima, termasuk persentase pencapaian kebutuhan pangan harian setiap lembaga.

4. **Core Infrastructure**
   Fondasi teknologi yang tangguh di balik layar untuk menjamin pelacakan rantai pasok secara *real-time*, pengawasan terhadap standar kebersihan dan keamanan makanan (*food safety hygiene*), serta penghitungan akurat atas emisi karbon yang berhasil direduksi.

---

## 💻 Prasyarat Sistem

Sebelum Anda mulai mengembangkan atau menjalankan platform ini, pastikan perangkat Anda telah terpasang:
* **Runtime**: [Node.js](https://nodejs.org/) (Direkomendasikan versi 18.0.0 atau yang lebih mutakhir)
* **Package Manager**: NPM (Akan otomatis terinstal bersama Node.js, disarankan versi 9.0.0 ke atas)
* **Browser**: Peramban web terkini seperti Google Chrome, Mozilla Firefox, Safari, atau Microsoft Edge untuk pengalaman antarmuka yang optimal.

---

## 🛠️ Petunjuk Instalasi dan Konfigurasi

Anda dapat mengikuti tahapan praktis di bawah ini untuk menginstalasi kode sumber ResFood pada lingkungan pengembangan lokal:

1. **Masuk ke Direktori Proyek**:
   ```bash
   cd resfood-app
   ```

2. **Instal Dependensi Backend**:
   Arahkan terminal ke dalam sub-direktori `backend`, kemudian unduh seluruh pustaka yang dibutuhkan:
   ```bash
   cd backend
   npm install
   ```

3. **Jalankan Server Pengembang**:
   Mulai layanan server dengan mengeksekusi skrip berikut:
   ```bash
   npm start
   ```
   Layanan API dan server akan langsung dapat diakses pada porta **5000**. Buka **[http://localhost:5000](http://localhost:5000)** pada peramban web Anda.

---

## 📖 Cara Penggunaan

Bila instalasi server sudah berhasil, Anda dapat mengakses URL **`http://localhost:5000`**. Untuk memudahkan proses evaluasi, kami telah menyediakan beberapa kredensial akun uji coba:

### A. Sebagai Mitra Kuliner (Restoran / Ritel)
* Akses portal kontrol khusus mitra menggunakan kredensial:
  * **Email**: `mitra@resfood.com`
  * **Kata Sandi**: `password123`
* Melalui dasbor ini, Anda bisa mengunggah inventaris makanan surplus yang siap dijual. Data yang Anda masukkan akan seketika tayang di halaman *Marketplace* publik.
* Anda juga berhak mengakses ringkasan metrik berkelanjutan, mencakup kalkulasi emisi karbon yang berhasil dihindari dan akumulasi poin *reward*.

### B. Sebagai Pembeli / UMKM (Marketplace)
* Silakan navigasikan ke menu **Marketplace**. Anda dapat memanfaatkan fitur **Peta Interaktif** untuk melacak lokasi penyedia makanan terdekat (khususnya wilayah Jakarta), atau beralih ke tampilan **Daftar** untuk penelusuran konvensional.
* Gunakan filter kategori yang tersedia (misalnya Makanan Siap Saji, Roti & Kue) untuk mempermudah pencarian, lalu lakukan klaim pesanan.
* Setiap klaim yang divalidasi akan menghasilkan **Kode Unik Penukaran** (seperti `RES-XXXX`). Tunjukkan kode tersebut kepada staf mitra kami di lokasi pengambilan.

### C. Sebagai Lembaga Sosial & Relawan (Smart Redistribution Network)
* Log masuk sebagai perwakilan komunitas menggunakan:
  * **Email**: `panti@resfood.com`
  * **Kata Sandi**: `password123`
* Anda berhak menerbitkan kampanye penggalangan donasi makanan yang bersifat darurat, baik dalam bentuk makanan mentah maupun siap saji.
* Donatur dan mitra bisnis dapat berkontribusi langsung dengan mengirimkan pasokan surplus sesuai kuota yang dibutuhkan.
* Kami juga membuka ruang bagi pengguna umum untuk bergabung sebagai **Kurir Relawan** demi melancarkan proses logistik dari penyedia ke lokasi lembaga.

---

## 📄 Informasi Lisensi

Perangkat lunak ini dikembangkan secara terbuka dengan lisensi **MIT License**. Hal ini memberikan Anda kebebasan luas untuk memakai, mengubah, serta mendistribusikan ulang kode ini dalam ranah komersial maupun pribadi, asalkan hak cipta awal tetap disertakan. Silakan membaca berkas `LICENSE` untuk rincian lebih lanjut.

---

## 👥 Kontribusi dan Kontak Pengembang

Kami sangat menyambut baik berbagai bentuk sumbangsih dari rekan-rekan pengembang! Jika Anda berminat menyempurnakan aplikasi ini, ikuti alur standar berikut:
1. Buat salinan (*fork*) mandiri dari repositori utama ini.
2. Inisiasi cabang eksperimental untuk perbaikan/fitur Anda: `git checkout -b fitur-keren-saya`.
3. Simpan revisi kode Anda secara rapi: `git commit -m "Menambahkan fitur penyelamatan pangan baru"`.
4. Unggah revisi tersebut ke GitHub Anda: `git push origin fitur-keren-saya`.
5. Ajukan *Pull Request* (PR) agar tim inti kami dapat meninjau kode Anda.

### Hubungi Tim Pengembang
* **Email Dukungan & Kemitraan**: [info@resfood.com](mailto:info@resfood.com)
* **Hubungan Developer**: [dev@resfood.com](mailto:dev@resfood.com)
* **Telepon Hotline**: +62 (21) 1234-5678
* **Alamat Kantor**: Menara Rantai Pasok Hijau, DKI Jakarta, Indonesia.
