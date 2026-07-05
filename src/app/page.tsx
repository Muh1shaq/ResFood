"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldAlert, Sparkles, MapPin, Landmark, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-6">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 py-10 animate-slide-up">
        {/* Banner Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-4.5 h-4.5 fill-emerald-500/10" />
          <span>Mengurangi Pemborosan Makanan Secara Nyata</span>
        </div>

        {/* Catchy Header */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
          Selamatkan Makanan <br />
          <span className="gradient-text">Surplus Sekitarmu</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Hubungkan restoran, bakery, dan swalayan yang memiliki surplus makanan dengan masyarakat sekitar dan organisasi sosial. Nikmati makanan lezat dengan harga terjangkau sambil menyelamatkan bumi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/marketplace">
            <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
              Jelajahi Surplus Makanan <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/register?role=restaurant">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Gabung sebagai Mitra Restoran
            </Button>
          </Link>
        </div>

        {/* Metric Counters */}
        <div className="grid grid-cols-3 gap-6 pt-16 border-t border-slate-200/60 dark:border-slate-800/60 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-500">25K+ kg</p>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Makanan Diselamatkan</p>
          </div>
          <div className="text-center space-y-1 border-x border-slate-200/60 dark:border-slate-800/60">
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-500">18K+</p>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Porsi Terbagikan</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-500">140+</p>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Mitra Aktif</p>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars/Features Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bagaimana ResFood Bekerja?
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Kami menciptakan jembatan digital yang aman dan transparan bagi semua pihak untuk meminimalkan food waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Marketplace */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Deteksi Lokasi Terdekat</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Temukan surplus makanan dari restoran, kafe, dan toko kelontong di sekitarmu secara real-time dengan bantuan peta terintegrasi.
              </p>
              <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-500 hover:text-emerald-600">
                Buka Peta Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Food Bank */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Hubungkan ke Food Bank</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Mitra restoran dapat menyumbangkan makanan surplus berskala besar langsung ke organisasi sosial dan lembaga penyalur pangan secara efisien.
              </p>
              <Link href="/donor" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500 hover:text-amber-600">
                Lihat Program Donasi <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Card 3: Dashboard */}
          <Card className="hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Dampak Sosial & Karbon</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Pantau dampak penyelamatan makanan Anda terhadap lingkungan dan reduksi emisi CO2 langsung melalui dasbor mitra terpadu.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-600">
                Buka Dasbor Mitra <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Promotional/Call-to-Action Section */}
      <section className="glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="space-y-4 max-w-xl text-left">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Punya Usaha Kuliner? <br />
            <span className="text-emerald-500">Mulai Selamatkan Makanan Anda</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Kurangi kerugian finansial dari bahan pangan berlebih. Daftarkan tokomu hari ini, pasang menu surplus dengan diskon khusus, dan jangkau pelanggan baru yang peduli lingkungan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Link href="/register?role=restaurant" className="w-full">
            <Button size="lg" className="w-full">Daftar Sebagai Mitra</Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button size="lg" variant="secondary" className="w-full">Masuk ke Portal</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
