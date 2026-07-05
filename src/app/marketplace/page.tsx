"use client";

import React, { useState } from "react";
import { Search, Map as MapIcon, List, Eye, ShieldCheck, Heart, Sparkles, X, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FoodMap from "@/components/maps/FoodMap";
import { FoodItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

// Mock surplus foods database
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
    distance: 0.8,
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
    distance: 1.5,
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
    distance: 2.1,
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
    distance: 1.1,
    type: "surplus",
  },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Claim states
  const [activeClaimItem, setActiveClaimItem] = useState<FoodItem | null>(null);
  const [claimQty, setClaimQty] = useState(1);
  const [claimSuccessCode, setClaimSuccessCode] = useState<string | null>(null);

  const categories = ["semua", "makanan berat", "roti & kue", "buah & sayur", "minuman"];

  // Filter foods
  const filteredFoods = MOCK_FOODS.filter((food) => {
    const matchesSearch = food.title.toLowerCase().includes(search.toLowerCase()) || 
                          food.restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "semua" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenClaim = (food: FoodItem) => {
    setActiveClaimItem(food);
    setClaimQty(1);
    setClaimSuccessCode(null);
  };

  const handleConfirmClaim = () => {
    if (!activeClaimItem) return;
    const generatedCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    setClaimSuccessCode(generatedCode);
  };

  return (
    <div className="space-y-8 py-6 animate-fade-in relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Marketplace Surplus</h1>
          <p className="text-slate-500 dark:text-slate-400">Selamatkan makanan lezat terdekat dengan potongan harga s.d 70%.</p>
        </div>
        
        {/* View Mode Switches */}
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
      </div>

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

      {/* Map View */}
      {viewMode === "map" && (
        <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-md">
          <FoodMap items={filteredFoods} onSelect={handleOpenClaim} />
        </div>
      )}

      {/* List View Grid */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-base font-semibold">Tidak menemukan makanan yang cocok.</p>
              <p className="text-sm">Cobalah mencari dengan kata kunci atau kategori lain.</p>
            </div>
          ) : (
            filteredFoods.map((food) => (
              <Card key={food.id} className="group overflow-hidden border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between">
                
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
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Halal
                    </span>
                  )}
                  {/* Distance badge */}
                  <span className="absolute bottom-3 right-3 glass text-xs font-semibold px-2 py-1 rounded-md text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    {food.distance} km
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
                    className="w-full mt-2"
                  >
                    Klaim Porsi
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Claim Dialog Modal */}
      {activeClaimItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="max-w-md w-full border-slate-200 dark:border-slate-800">
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
                      <p className="text-xs font-bold text-emerald-500 mt-1">{formatRupiah(activeClaimItem.discountPrice)} / porsi</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Porsi Pengambilan</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setClaimQty(Math.max(1, claimQty - 1))}
                        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-base w-8 text-center">{claimQty}</span>
                      <button
                        onClick={() => setClaimQty(Math.min(activeClaimItem.quantity, claimQty + 1))}
                        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                      <span className="text-xs text-slate-400 ml-auto">Tersedia: {activeClaimItem.quantity} porsi</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-semibold">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-500 font-extrabold text-lg">{formatRupiah(activeClaimItem.discountPrice * claimQty)}</span>
                  </div>

                  <Button
                    onClick={handleConfirmClaim}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Konfirmasi Pengambilan
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Klaim Berhasil Dibuat</h3>
                    <p className="text-xs text-slate-500">Tunjukkan kode berikut ke kasir mitra saat mengambil makanan.</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 border-2 border-dashed border-emerald-500/20 rounded-xl max-w-[200px] mx-auto">
                    <span className="font-mono text-2xl font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                      {claimSuccessCode}
                    </span>
                  </div>
                  <div className="text-left text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-lg space-y-1 border border-slate-100 dark:border-slate-800">
                    <p>📍 <strong>Alamat:</strong> {activeClaimItem.restaurantName}, Jakarta Selatan</p>
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

    </div>
  );
}
