"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar, ShoppingBag, Landmark, Award, ShieldCheck, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";

interface MockListing {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  expiry: string;
}

export default function DashboardPage() {
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

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("makanan berat");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");

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
      expiry: expiry || "Hari ini, 20:00 WIB",
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
    <div className="space-y-10 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dasbor Mitra Restoran</h1>
          <p className="text-slate-500 dark:text-slate-400">Selamat datang kembali! Pantau dan kelola surplus makanan Anda di sini.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold">
          <ShieldCheck className="w-5 h-5" />
          <span>Restoran Terverifikasi</span>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Diselamatkan</p>
              <p className="text-3xl font-extrabold">248 Porsi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Nilai Ekonomi Kembali</p>
              <p className="text-3xl font-extrabold">{formatRupiah(3720000)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Reduksi Karbon CO2</p>
              <p className="text-3xl font-extrabold text-emerald-500">620 Kg</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Skor Kebaikan Mitra</p>
              <p className="text-3xl font-extrabold">Level 4</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create food surplus item form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-200/60 dark:border-slate-800/80">
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
                    placeholder="cth. Hari ini, 21:00 WIB"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
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
          <Card className="border-slate-200/60 dark:border-slate-800/80">
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
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all"
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
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {item.expiry}
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
