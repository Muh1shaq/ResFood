"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Map as MapIcon,
  List,
  Eye,
  ShieldCheck,
  X,
  CheckCircle,
  Clock,
  MapPin,
  MapPinOff,
  Compass,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FoodMap from "@/components/maps/FoodMap";
import LocationPermissionModal from "@/components/shared/LocationPermissionModal";
import { FoodItem } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Konstanta radius maksimal rekomendasi surplus (default 5 km)
const DEFAULT_RADIUS_KM = 5;
const SESSION_LOCATION_KEY = "resfood_user_location";

// Helper Haversine Distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadian = (angle: number) => (Math.PI / 180) * angle;
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = toRadian(lat2 - lat1);
  const dLon = toRadian(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(lat1)) *
      Math.cos(toRadian(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIUS_OF_EARTH_IN_KM * c;
}

// Fallback Mock surplus foods database jika offline / data kosong
const MOCK_FOODS: FoodItem[] = [
  {
    id: "1",
    restaurantId: "r1",
    restaurantName: "Bakery Aroma Indah",
    title: "Donat & Muffin Aneka Rasa (Satu Kotak)",
    description: "Satu kotak berisi 6 donat campuran rasa cokelat, keju, dan stroberi. Masih sangat empuk dan diproduksi pagi ini.",
    originalPrice: 60000,
    discountPrice: 20000,
    quantity: 4,
    expiryTime: "Hari ini, 22:00 WIB",
    imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
    category: "roti & kue",
    isHalal: true,
    latitude: -6.2100,
    longitude: 106.8400,
    type: "surplus",
  },
  {
    id: "2",
    restaurantId: "r2",
    restaurantName: "Warung Sederhana Bu Joko",
    title: "Nasi Rames Rendang Lengkap",
    description: "Nasi rames dengan lauk utama rendang sapi, sayur nangka, sambal ijo, dan daun singkong. Makanan surplus makan siang yang belum tersentuh.",
    originalPrice: 35000,
    discountPrice: 12000,
    quantity: 2,
    expiryTime: "Hari ini, 17:00 WIB",
    imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80",
    category: "makanan berat",
    isHalal: true,
    latitude: -6.2050,
    longitude: 106.8500,
    type: "surplus",
  },
  {
    id: "3",
    restaurantId: "r3",
    restaurantName: "Supermarket Segar Abadi",
    title: "Keranjang Buah Musiman (Apel & Jeruk)",
    description: "Keranjang buah berisi buah segar dengan sedikit cacat kulit luar namun bagian dalam masih sangat manis dan baik dikonsumsi.",
    originalPrice: 45000,
    discountPrice: 15000,
    quantity: 6,
    expiryTime: "Besok, 12:00 WIB",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-ee56336191d1?w=400&q=80",
    category: "buah & sayur",
    isHalal: true,
    latitude: -6.2150,
    longitude: 106.8450,
    type: "surplus",
  },
  {
    id: "4",
    restaurantId: "r4",
    restaurantName: "Kopi Seduh Senja",
    title: "Ice Matcha Latte & Croissant Karamel",
    description: "Minuman dingin matcha latte beserta pastry croissant manis sisa counter display sore ini.",
    originalPrice: 55000,
    discountPrice: 18000,
    quantity: 3,
    expiryTime: "Hari ini, 20:30 WIB",
    imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80",
    category: "minuman",
    isHalal: true,
    latitude: -6.2000,
    longitude: 106.8380,
    type: "surplus",
  },
];

export default function MarketplacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Search, filter, dan view
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Lokasi & modal state
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);

  // Claim states
  const [activeClaimItem, setActiveClaimItem] = useState<FoodItem | null>(null);
  const [claimQty, setClaimQty] = useState(1);
  const [claimSuccessCode, setClaimSuccessCode] = useState<string | null>(null);
  const [deliveryPin, setDeliveryPin] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);

  const categories = ["semua", "makanan berat", "roti & kue", "buah & sayur", "minuman"];

  // 1. Proteksi Route: Cek autentikasi user
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/?authModal=true&redirect=/marketplace");
    }
  }, [user, authLoading, router]);

  // 2. Cek apakah lokasi sudah ada di session saat pertama kali dibuka
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(SESSION_LOCATION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
            setUserCoords(parsed);
            return;
          }
        } catch {
          sessionStorage.removeItem(SESSION_LOCATION_KEY);
        }
      }
      // Lokasi belum ada di sesi: tampilkan modal izin lokasi
      setIsLocationModalOpen(true);
    }
  }, []);

  // 3. Handler saat izin lokasi diterima
  const handleLocationSuccess = async (coords: { latitude: number; longitude: number }) => {
    setUserCoords(coords);
    setIsLocationModalOpen(false);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_LOCATION_KEY, JSON.stringify(coords));
    }

    // Simpan koordinat ke profil user di Supabase jika sudah login
    if (user?.id) {
      try {
        await supabase
          .from("users")
          .update({ current_lat: coords.latitude, current_lng: coords.longitude })
          .eq("id", user.id);
      } catch (err) {
        console.error("Gagal sinkronisasi koordinat ke Supabase:", err);
      }
    }
  };

  // 4. Handler saat izin lokasi ditolak
  const handleLocationDeny = () => {
    setIsLocationModalOpen(false);
    // userCoords tetap null, halaman akan menampilkan empty state
  };

  // 5. Ambil data makanan dari Supabase & hitung jarak Haversine saat lokasi tersedia
  useEffect(() => {
    if (!userCoords) return;

    const fetchFoods = async () => {
      setIsLoadingFoods(true);
      try {
        const { data, error } = await supabase
          .from("foods")
          .select("*")
          .eq("type", "surplus");

        let rawItems: FoodItem[] = [];

        if (!error && data && data.length > 0) {
          rawItems = data.map((row: any) => ({
            id: row.id.toString(),
            restaurantId: row.restaurant_id?.toString() || "r1",
            restaurantName: row.restaurant_name || "Mitra ResFood",
            title: row.title,
            description: row.description || "",
            originalPrice: Number(row.original_price) || 0,
            discountPrice: Number(row.discount_price) || 0,
            quantity: Number(row.quantity) || 0,
            expiryTime: row.expiry_time || "Hari ini",
            imageUrl: row.image_url || "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
            category: row.category || "makanan berat",
            isHalal: row.is_halal ?? true,
            latitude: Number(row.latitude) || -6.2088,
            longitude: Number(row.longitude) || 106.8456,
            type: "surplus",
          }));
        } else {
          rawItems = MOCK_FOODS;
        }

        // Hitung jarak dinamis untuk setiap item menggunakan Haversine
        const itemsWithDistance = rawItems.map((item) => {
          const dist = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            item.latitude,
            item.longitude
          );
          const roundedDist = Math.round(dist * 10) / 10;
          return {
            ...item,
            distance: roundedDist,
          };
        });

        // Filter dalam radius maksimal 5 km & urutkan dari yang terdekat
        const withinRadius = itemsWithDistance
          .filter((item) => (item.distance ?? 999) <= DEFAULT_RADIUS_KM)
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

        setFoods(withinRadius);
      } catch (err) {
        console.error("Error mengambil makanan surplus:", err);
        const fallbackItems = MOCK_FOODS.map((item) => {
          const dist = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            item.latitude,
            item.longitude
          );
          return {
            ...item,
            distance: Math.round(dist * 10) / 10,
          };
        })
          .filter((item) => (item.distance ?? 999) <= DEFAULT_RADIUS_KM)
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

        setFoods(fallbackItems);
      } finally {
        setIsLoadingFoods(false);
      }
    };

    fetchFoods();
  }, [userCoords]);

  // Filter pencarian dan kategori pada makanan yang sudah dalam radius 5 km
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.title.toLowerCase().includes(search.toLowerCase()) ||
      food.restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "semua" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 6. Alur Klaim Porsi (tanpa meminta izin lokasi lagi karena lokasi sudah ada)
  const handleOpenClaim = (food: FoodItem) => {
    setActiveClaimItem(food);
    setClaimQty(food.quantity > 0 ? 1 : 0);
    setClaimSuccessCode(null);
    setDeliveryPin(null);

    const dist = food.distance ?? 1;
    setDistanceKm(dist);
    setDeliveryFee(Math.ceil(dist) * 2000); // Rp 2000 per km
  };

  const handleConfirmClaim = async () => {
    if (!activeClaimItem) return;
    const generatedCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const genDeliveryPin = Math.floor(100000 + Math.random() * 900000).toString();

    setClaimSuccessCode(generatedCode);
    setDeliveryPin(genDeliveryPin);
  };

  // Jangan render jika belum login atau sedang pengecekan autentikasi
  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 animate-fade-in relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Marketplace Surplus</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Selamatkan makanan lezat terdekat dalam radius {DEFAULT_RADIUS_KM} km dengan potongan harga s.d 70%.
          </p>
        </div>

        {/* View Mode Switches (hanya jika lokasi tersedia) */}
        {userCoords && (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/80">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <List className="w-4 h-4" /> Daftar
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "map"
                  ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <MapIcon className="w-4 h-4" /> Peta
            </button>
          </div>
        )}
      </div>

      {/* JIKA LOKASI BELUM TERSEDIA / DITOLAK: Tampilkan State Kosong Khusus Lokasi */}
      {!userCoords ? (
        <div className="text-center py-20 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
            <MapPinOff className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Akses Lokasi Diperlukan
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              ResFood memerlukan izin akses lokasi untuk menampilkan rekomendasi surplus makanan terdekat dalam radius {DEFAULT_RADIUS_KM} km dari posisi Anda.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsLocationModalOpen(true)}
            className="rounded-full px-8 gap-2 font-semibold shadow-md shadow-emerald-500/20"
          >
            <MapPin className="w-4 h-4" /> Izinkan Lokasi
          </Button>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <Input
                placeholder="Cari roti, makanan berat, resto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4.5 h-4.5" />}
              />
            </div>

            {/* Category tags */}
            <div className="md:col-span-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border capitalize transition-all duration-200 ${
                    selectedCategory === cat
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator saat mengambil data makanan */}
          {isLoadingFoods ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm">Mencari surplus makanan dalam radius {DEFAULT_RADIUS_KM} km...</p>
            </div>
          ) : foods.length === 0 ? (
            /* Empty State 1: Tidak ada makanan sama sekali dalam radius 5 km */
            <div className="text-center py-20 px-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Tidak Ada Makanan dalam Radius {DEFAULT_RADIUS_KM} km
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Saat ini belum ada mitra restoran atau toko yang menyediakan surplus makanan di sekitar lokasi Anda. Silakan cek kembali beberapa saat lagi.
              </p>
            </div>
          ) : viewMode === "map" ? (
            /* Map View */
            <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-md">
              <FoodMap items={filteredFoods} onSelect={handleOpenClaim} />
            </div>
          ) : (
            /* List View Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.length === 0 ? (
                /* Empty State 2: Ada makanan dalam radius 5 km tapi tidak cocok kata kunci/kategori */
                <div className="col-span-full text-center py-20 text-slate-400">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-base font-semibold">Tidak menemukan makanan yang cocok.</p>
                  <p className="text-sm">Cobalah mencari dengan kata kunci atau kategori lain.</p>
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <Card
                    key={food.id}
                    className="group overflow-hidden border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={food.imageUrl}
                        alt={food.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Halal Badge */}
                      {food.isHalal && (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5" /> Halal
                        </span>
                      )}
                      {/* Distance badge: Memakai jarak hasil perhitungan Haversine */}
                      <span className="absolute bottom-3 right-3 glass text-xs font-semibold px-2.5 py-1 rounded-md text-slate-800 dark:text-slate-100 flex items-center gap-1 shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        {food.distance !== undefined ? `${food.distance} km` : "Dekat"}
                      </span>
                    </div>

                    <CardContent className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-emerald-500 capitalize">{food.category}</p>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                          {food.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">{food.restaurantName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {food.description}
                        </p>
                      </div>

                      {/* Expiry Alert */}
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Batas: {food.expiryTime}</span>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          <p className="text-sm font-extrabold text-emerald-500">{formatRupiah(food.discountPrice)}</p>
                          <p className="text-xs text-slate-400 line-through">{formatRupiah(food.originalPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Tersisa</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{food.quantity} Porsi</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenClaim(food)}
                        className="w-full mt-2 font-semibold"
                        disabled={food.quantity === 0}
                      >
                        {food.quantity === 0 ? "Stok Habis" : "Klaim Porsi"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Claim Dialog Modal (Lokasi sudah terdeteksi di awal) */}
      {activeClaimItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Klaim Surplus Pangan</CardTitle>
              <button
                onClick={() => setActiveClaimItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!claimSuccessCode ? (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeClaimItem.imageUrl}
                      alt={activeClaimItem.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{activeClaimItem.title}</h4>
                      <p className="text-xs text-slate-400">{activeClaimItem.restaurantName}</p>
                      <p className="text-xs font-bold text-emerald-500 mt-1">
                        {formatRupiah(activeClaimItem.discountPrice)} / porsi
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Porsi Pengambilan
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setClaimQty(Math.max(activeClaimItem.quantity > 0 ? 1 : 0, claimQty - 1))}
                        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-bold"
                        disabled={activeClaimItem.quantity === 0}
                      >
                        -
                      </button>
                      <span className="font-extrabold text-base w-8 text-center">{claimQty}</span>
                      <button
                        onClick={() => setClaimQty(Math.min(activeClaimItem.quantity, claimQty + 1))}
                        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-bold"
                        disabled={activeClaimItem.quantity === 0}
                      >
                        +
                      </button>
                      <span className="text-xs text-slate-400 ml-auto">
                        Tersedia: {activeClaimItem.quantity} porsi
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-semibold">
                    <span>Harga Makanan</span>
                    <span>{formatRupiah(activeClaimItem.discountPrice * claimQty)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Ongkos Kirim {distanceKm !== null ? `(${distanceKm} km)` : ""}</span>
                    <span>{formatRupiah(deliveryFee)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-semibold">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-500 font-extrabold text-lg">
                      {formatRupiah(activeClaimItem.discountPrice * claimQty + deliveryFee)}
                    </span>
                  </div>

                  <Button
                    onClick={handleConfirmClaim}
                    className="w-full flex items-center justify-center gap-1.5 font-semibold"
                    disabled={activeClaimItem.quantity === 0 || claimQty === 0}
                  >
                    <CheckCircle className="w-4 h-4" /> Konfirmasi Pesanan & Kurir
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Pesanan Sedang Diproses</h3>
                    <p className="text-xs text-slate-500">
                      Sistem sedang menugaskan kurir terdekat. Berikan PIN ini kepada kurir saat pesanan tiba.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 border-2 border-dashed border-emerald-500/20 rounded-xl max-w-[200px] mx-auto">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">PIN PENYELESAIAN</p>
                    <span className="font-mono text-3xl font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                      {deliveryPin}
                    </span>
                  </div>
                  <div className="text-left text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-lg space-y-1 border border-slate-100 dark:border-slate-800">
                    <p>📍 <strong>ID Pesanan:</strong> {claimSuccessCode}</p>
                    <p>🛵 <strong>Status:</strong> Mencari Kurir Terdekat...</p>
                    <p>💰 <strong>Total Pembayaran:</strong> {formatRupiah(activeClaimItem.discountPrice * claimQty + deliveryFee)}</p>
                    <p>📍 <strong>Alamat Resto:</strong> {activeClaimItem.restaurantName}</p>
                    <p>🕒 <strong>Batas Pengambilan:</strong> {activeClaimItem.expiryTime}</p>
                  </div>
                  <Button
                    onClick={() => setActiveClaimItem(null)}
                    variant="secondary"
                    className="w-full"
                  >
                    Tutup Halaman
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Permintaan Izin Lokasi Reusable */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={handleLocationDeny}
        onSuccess={handleLocationSuccess}
      />
    </div>
  );
}
