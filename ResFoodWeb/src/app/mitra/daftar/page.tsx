"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Building, ShieldCheck, MapPin, CreditCard, ChevronRight } from "lucide-react";

export default function MitraDaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [otp, setOtp] = useState("");
  const [nik, setNik] = useState("");
  const [ktpName, setKtpName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [address, setAddress] = useState("");

  const handleNextStep = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      if (step === 1) {
        // Step 1: Register Account & Request OTP
        // Note: In real app, we use fetch('/api/merchant/onboarding')
        // For this demo, we simulate success if fields are filled
        if (!email || !password || !name || !phone) {
          throw new Error("Semua kolom profil wajib diisi");
        }
        // Simulate backend delay and response
        await new Promise(r => setTimeout(r, 800));
        setUserId("mock-user-123"); 
        setStep(2);
      } 
      else if (step === 2) {
        // Step 2: Verify OTP
        if (otp !== "123456") {
          throw new Error("OTP salah! Masukkan 123456 untuk keperluan demo.");
        }
        await new Promise(r => setTimeout(r, 600));
        setStep(3);
      }
      else if (step === 3) {
        // Step 3: Verify KTP
        if (nik.length !== 16) {
          throw new Error("Validasi Gagal: NIK harus persis 16 digit angka.");
        }
        if (!ktpName) {
          throw new Error("Nama sesuai KTP wajib diisi.");
        }
        await new Promise(r => setTimeout(r, 1000));
        setStep(4);
      }
      else if (step === 4) {
        // Step 4: Verify Bank
        if (!bankName || !bankAccount || !bankAccountName) {
          throw new Error("Data bank tidak lengkap.");
        }
        // Demo rule: bank account name must contain part of ktp name
        if (!bankAccountName.toLowerCase().includes(ktpName.toLowerCase().split(' ')[0])) {
          throw new Error("Nama di rekening tidak cocok dengan nama di KTP! Surat kuasa diperlukan (Demo: samakan kata pertama nama).");
        }
        await new Promise(r => setTimeout(r, 800));
        setStep(5);
      }
      else if (step === 5) {
        // Step 5: Submit Outlet Address
        if (address.length < 10) {
          throw new Error("Alamat outlet terlalu pendek.");
        }
        await new Promise(r => setTimeout(r, 1200));
        setStep(6);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Daftar Mitra ResFood</h1>
        <p className="text-slate-500 mt-2">Gabung bersama kami menyelamatkan makanan berlebih & dapatkan penghasilan tambahan.</p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
        {[
          { id: 1, label: "Akun", icon: <Building className="w-4 h-4" /> },
          { id: 2, label: "Kontak", icon: <Smartphone className="w-4 h-4" /> },
          { id: 3, label: "Identitas", icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 4, label: "Pencairan", icon: <CreditCard className="w-4 h-4" /> },
          { id: 5, label: "Outlet", icon: <MapPin className="w-4 h-4" /> },
        ].map((s) => (
          <div key={s.id} className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
              step > s.id ? 'bg-emerald-500 text-white' : 
              step === s.id ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.icon}
            </div>
            <span className={`text-xs font-semibold ${step >= s.id ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg">
            {step === 1 && "Langkah 1: Informasi Usaha"}
            {step === 2 && "Langkah 2: Verifikasi Kontak"}
            {step === 3 && "Langkah 3: Validasi Identitas Pemilik (KTP)"}
            {step === 4 && "Langkah 4: Validasi Rekening Pencairan"}
            {step === 5 && "Langkah 5: Lokasi Fisik Restoran"}
            {step === 6 && "Pendaftaran Selesai!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nama Restoran / Usaha</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Bakery Aroma Indah" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Alamat Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="resto@example.com" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Nomor WhatsApp Aktif</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="081234567890" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Kata Sandi</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center py-4">
              <Smartphone className="w-12 h-12 text-emerald-500 mx-auto opacity-50" />
              <p className="text-slate-600">Kode OTP telah dikirimkan ke email dan nomor WhatsApp <strong>{phone}</strong>.</p>
              <div className="max-w-xs mx-auto pt-4">
                <label className="text-sm font-bold text-slate-600 mb-1 block text-left">Masukkan 6-digit OTP (Demo: 123456)</label>
                <Input 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="------" 
                  className="text-center text-2xl tracking-widest font-mono h-14"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold mb-4 border border-amber-200">
                Data ini akan diintegrasikan dengan Dukcapil secara otomatis untuk mencegah penipuan identitas.
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nomor Induk Kependudukan (NIK)</label>
                <Input value={nik} onChange={e => setNik(e.target.value)} placeholder="16 digit angka KTP" maxLength={16} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nama Lengkap (Sesuai KTP)</label>
                <Input value={ktpName} onChange={e => setKtpName(e.target.value)} placeholder="NAMA LENGKAP" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold mb-4 border border-blue-200">
                Uang penjualan akan ditransfer ke rekening ini. Nama pemilik rekening harus sesuai dengan nama KTP ({ktpName}).
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nama Bank</label>
                <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Contoh: BCA, Mandiri, BRI" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nomor Rekening</label>
                <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="Nomor rekening valid" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nama Pemilik Rekening</label>
                <Input value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="Sesuai buku tabungan" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold mb-4 border border-emerald-200">
                Tahap terakhir! Daftarkan alamat fisik resto Anda. Tim kami akan melakukan verifikasi fisik/digital untuk mencegah adanya "restoran hantu/fiktif".
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Alamat Lengkap Outlet Fisik</label>
                <textarea 
                  className="w-full flex min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Nama jalan, Nomor gedung, RT/RW, Kecamatan, Kota, Provinsi, Kode Pos..."
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Pendaftaran Berhasil & Tervalidasi!</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Terima kasih telah bergabung. Semua dokumen dan identitas Anda telah berhasil divalidasi oleh sistem. Anda sekarang bisa mulai menjual makanan surplus!
              </p>
              <div className="pt-6">
                <Button onClick={() => router.push("/dashboard-resto")} className="w-full sm:w-auto px-8">
                  Menuju Dashboard Restoran
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 6 && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={handleNextStep} disabled={loading} className="px-8 flex items-center gap-2">
                {loading ? "Memproses..." : (
                  <>
                    {step === 5 ? "Kirim Pengajuan" : "Lanjut Verifikasi"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
