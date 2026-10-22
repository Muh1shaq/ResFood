"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ShoppingBag, 
  Landmark, 
  Award, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  Bell, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Settings,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface MockListing {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  expiry: string;
}

const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function DashboardPage() {
  const { user } = useAuth();

  const [listings, setListings] = useState<MockListing[]>([
    {
      id: "1",
      title: "Roti Croissant Cokelat (Paket 5 Porsi)",
      category: "roti & kue",
      price: 25000,
      originalPrice: 75000,
      quantity: 3,
      expiry: "Hari ini, 21:00 WIB",
    },
    {
      id: "2",
      title: "Nasi Ayam Bakar Spesial (Surplus Makan Siang)",
      category: "makanan berat",
      price: 15000,
      originalPrice: 35000,
      quantity: 5,
      expiry: "Hari ini, 16:00 WIB",
    },
  ]);

  // Food Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("makanan berat");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");

  // Schedule States
  const [sessionName, setSessionName] = useState("Sesi Malam Surplus");
  const [openTime, setOpenTime] = useState("19:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [activeDays, setActiveDays] = useState<string[]>(ALL_DAYS);
  const [isActiveSchedule, setIsActiveSchedule] = useState(true);
  const [autoNotify, setAutoNotify] = useState(true);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleFeedback, setScheduleFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Test notification trigger state
  const [testTriggerLoading, setTestTriggerLoading] = useState<string | null>(null);
  const [testTriggerSuccess, setTestTriggerSuccess] = useState<string | null>(null);

  // Fetch initial schedule
  useEffect(() => {
    const merchantId = user?.id || "1";
    fetch(`${API_BASE_URL}/api/merchants/${merchantId}/schedule`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSessionName(res.data.session_name || "Sesi Malam Surplus");
          setOpenTime(res.data.open_time?.slice(0, 5) || "19:00");
          setCloseTime(res.data.close_time?.slice(0, 5) || "21:00");
          if (Array.isArray(res.data.active_days)) {
            setActiveDays(res.data.active_days);
          }
          setIsActiveSchedule(res.data.is_active !== undefined ? res.data.is_active : true);
          setAutoNotify(res.data.auto_notify !== undefined ? res.data.auto_notify : true);
        }
      })
      .catch((err) => console.warn("Notice loading schedule:", err));
  }, [user?.id]);

  // Check if store is currently within surplus operational hours
  const isCurrentlyOpen = () => {
    if (!isActiveSchedule) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [oh, om] = openTime.split(":").map(Number);
    const [ch, cm] = closeTime.split(":").map(Number);
    const openMins = oh * 60 + om;
    const closeMins = ch * 60 + cm;

    return currentMins >= openMins && currentMins < closeMins;
  };

  const handleToggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      if (activeDays.length === 1) return; // minimal 1 hari aktif
      setActiveDays(activeDays.filter((d) => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleFeedback(null);

    const [oh, om] = openTime.split(":").map(Number);
    const [ch, cm] = closeTime.split(":").map(Number);
    if (oh * 60 + om >= ch * 60 + cm) {
      setScheduleFeedback({
        type: "error",
        text: "Jam penutupan (close_time) harus lebih besar dari jam pembukaan (open_time).",
      });
      return;
    }

    setIsSavingSchedule(true);
    const merchantId = user?.id || "1";

    try {
      const res = await fetch(`${API_BASE_URL}/api/merchants/${merchantId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionName,
          openTime: `${openTime}:00`,
          closeTime: `${closeTime}:00`,
          activeDays,
          isActive: isActiveSchedule,
          autoNotify,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setScheduleFeedback({
          type: "success",
          text: "Jadwal operasional berhasil diperbarui & disinkronkan ke engine notifikasi!",
        });
      } else {
        setScheduleFeedback({
          type: "error",
          text: json.message || "Gagal menyimpan jadwal operasional.",
        });
      }
    } catch (err: any) {
      setScheduleFeedback({
        type: "error",
        text: "Gagal menghubungi backend API pada port 5000.",
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleTestTrigger = async (scenario: "PREP_REMINDER" | "SURPLUS_OPEN" | "LAST_CALL") => {
    setTestTriggerLoading(scenario);
    setTestTriggerSuccess(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/trigger-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          targetUserId: user?.id || "1",
          merchantName: user?.name || "Bakery Aroma Indah",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestTriggerSuccess(`Berhasil memicu: ${scenario}! Periksa lonceng notifikasi di Navbar.`);
      }
    } catch (err) {
      setTestTriggerSuccess("Gagal memicu trigger pengujian.");
    } finally {
      setTestTriggerLoading(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !price || !quantity) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    const numPrice = Number(price);
    const numQuantity = Number(quantity);
    const numOriginalPrice = Number(originalPrice) || numPrice * 2;

    if (numQuantity <= 0) {
      setError("Jumlah porsi harus lebih dari 0.");
      return;
    }

    if (numPrice < 0 || numOriginalPrice < 0) {
      setError("Harga tidak boleh bernilai negatif.");
      return;
    }

    if (numOriginalPrice < numPrice) {
      setError("Harga asli tidak boleh lebih rendah dari harga diskon.");
      return;
    }

    const newItem: MockListing = {
      id: Math.random().toString(),
      title,
      category,
      price: numPrice,
      originalPrice: numOriginalPrice,
      quantity: numQuantity,
      expiry: expiry || `Hari ini, ${closeTime} WIB`,
    };

    setListings([newItem, ...listings]);
    setTitle("");
    setPrice("");
    setOriginalPrice("");
    setQuantity("");
    setExpiry("");
  };

  const handleDelete = (id: string) => {
    setListings(listings.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-10 py-6 animate-fade-in max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dasbor Mitra Restoran
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pantau inventaris surplus, atur jam operasional penjualan, dan kelola notifikasi pelanggan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Buka / Tutup Operasional */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              isCurrentlyOpen()
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isCurrentlyOpen() ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>
              {isCurrentlyOpen()
                ? `Sesi Dibuka (${openTime} - ${closeTime})`
                : `Sesi Tutup (Buka: ${openTime} - ${closeTime})`}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Mitra Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Diselamatkan</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">248 Porsi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nilai Ekonomi Kembali</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{formatRupiah(3720000)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reduksi Karbon CO2</p>
              <p className="text-3xl font-extrabold text-emerald-500">620 Kg</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Skor Kebaikan Mitra</p>
              <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">Level 4</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* FEATURE: Pengaturan Jam Operasional Surplus & Notifikasi */}
      {/* ============================================================ */}
      <Card className="border-2 border-emerald-500/20 dark:border-emerald-500/20 bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 shadow-md">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Pengaturan Jam Operasional Surplus Mitra
                </CardTitle>
                <CardDescription>
                  Tentukan rentang jam buka penjualan surplus dan aktifkan pemicu notifikasi otomatis ke pembeli & kurir.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status Sesi:</span>
              <button
                type="button"
                onClick={() => setIsActiveSchedule(!isActiveSchedule)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActiveSchedule ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActiveSchedule ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isActiveSchedule ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSaveSchedule} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Nama Sesi */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Sesi Operasional
                </label>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="cth. Sesi Malam Surplus"
                  required
                />
              </div>

              {/* Jam Buka */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jam Buka Surplus (open_time)
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Notifikasi persiapan dikirim H-15 menit (jam {(() => {
                    const [h, m] = openTime.split(":").map(Number);
                    const total = h * 60 + m - 15;
                    const ph = Math.floor((total + 1440) % 1440 / 60);
                    const pm = (total + 1440) % 60;
                    return `${String(ph).padStart(2, "0")}:${String(pm).padStart(2, "0")}`;
                  })()})
                </p>
              </div>

              {/* Jam Tutup */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jam Tutup Surplus (close_time)
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Last call dikirim H-30 menit (jam {(() => {
                    const [h, m] = closeTime.split(":").map(Number);
                    const total = h * 60 + m - 30;
                    const ph = Math.floor((total + 1440) % 1440 / 60);
                    const pm = (total + 1440) % 60;
                    return `${String(ph).padStart(2, "0")}:${String(pm).padStart(2, "0")}`;
                  })()})
                </p>
              </div>
            </div>

            {/* Hari Aktif Penjualan */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hari Aktif Sesi Penjualan Surplus
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const isSelected = activeDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Auto Notify */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-500" />
                  Notifikasi Otomatis ke Pembeli & Kurir (Auto-Notify)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kirim alert otomatis saat jam surplus dimulai ke konsumen & kurir dalam radius 10 km (menggunakan Haversine Formula).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoNotify(!autoNotify)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoNotify ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoNotify ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Feedback alert */}
            {scheduleFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  scheduleFeedback.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {scheduleFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{scheduleFeedback.text}</span>
              </div>
            )}

            {/* Tombol Simpan */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSavingSchedule}
                className="rounded-xl px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20"
              >
                {isSavingSchedule ? "Menyimpan Jadwal..." : "Simpan Pengaturan Jadwal"}
              </Button>
            </div>
          </form>

          {/* Dev Test Section: Instant Trigger Buttons */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Panel Uji Coba Trigger Notifikasi (Development Simulation)
              </span>
              {testTriggerSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {testTriggerSuccess}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={!!testTriggerLoading}
                onClick={() => handleTestTrigger("PREP_REMINDER")}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 text-left transition-colors"
              >
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Trigger 1: H-15 Menit</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Kirim pengingat persiapan stok & checklist ke Mitra.
                </p>
              </button>

              <button
                type="button"
                disabled={!!testTriggerLoading}
                onClick={() => handleTestTrigger("SURPLUS_OPEN")}
                className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 text-left transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trigger 2: Jam Buka (00m)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Broadcast buka ke Pembeli & Kurir (radius 10 km).
                </p>
              </button>

              <button
                type="button"
                disabled={!!testTriggerLoading}
                onClick={() => handleTestTrigger("LAST_CALL")}
                className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 text-left transition-colors"
              >
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Trigger 3: Last Call (H-30m)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Peringatkan pembeli pesanan belum diambil.
                </p>
              </button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Main Grid: Add food & Active listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create food surplus item form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Tambah Makanan Surplus</CardTitle>
              <CardDescription>Pasang makanan berlebih berkualitas baik dengan harga bersahabat</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Makanan</label>
                  <Input
                    placeholder="cth. 1 Lusin Donat Campuran"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                    >
                      <option value="makanan berat">Makanan Berat</option>
                      <option value="roti & kue">Roti & Kue</option>
                      <option value="buah & sayur">Buah & Sayur</option>
                      <option value="minuman">Minuman</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Jumlah Porsi</label>
                    <Input
                      type="number"
                      placeholder="5"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Harga Asli (Rp)</label>
                    <Input
                      type="number"
                      placeholder="50000"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Harga Jual (Rp)</label>
                    <Input
                      type="number"
                      placeholder="15000"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Batas Waktu Pengambilan</label>
                  <Input
                    placeholder={`cth. Hari ini, ${closeTime} WIB`}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400">
                    Disarankan sesuai batas jam tutup sesi ({closeTime} WIB).
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full mt-4 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Publikasikan Makanan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Listings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Daftar Makanan Aktif</CardTitle>
                <CardDescription>Menu surplus yang saat ini terdaftar di marketplace</CardDescription>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                {listings.length} Menu
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {listings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Tidak ada makanan aktif. Silakan tambahkan menu baru.</p>
                </div>
              ) : (
                listings.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all bg-slate-50/30 dark:bg-slate-800/20"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {item.category}
                        </span>
                        <span>Stok: <strong>{item.quantity} porsi</strong></span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3.5 h-3.5" /> {item.expiry}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-emerald-500">{formatRupiah(item.price)}</p>
                        <p className="text-[10px] text-slate-400 line-through">{formatRupiah(item.originalPrice)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
