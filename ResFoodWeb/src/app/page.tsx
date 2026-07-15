"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, MapPin, Landmark, HeartHandshake, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 border border-emerald-200 dark:border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Kurangi Food Waste, Mulai Hari Ini</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight mb-6">
          Selamatkan Makanan <br className="hidden md:block" />
          <span className="text-emerald-500">Surplus Sekitarmu</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Hubungkan restoran, kafe, dan swalayan yang memiliki surplus makanan dengan masyarakat sekitar. Nikmati makanan lezat dengan harga hemat sambil menyelamatkan bumi.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/marketplace" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all">
              Jelajahi Makanan <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Cara Kerja Section */}
      <section id="cara-kerja" className="py-24 bg-slate-50 dark:bg-slate-900/50 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Cara Kerja ResFood
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Proses yang mudah dan transparan untuk semua pihak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Temukan Lokasi</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cari makanan surplus dari mitra restoran terdekat di sekitarmu menggunakan peta interaktif secara real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <Landmark className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Pesan & Bayar</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pesan porsi makanan dengan harga sangat terjangkau, lalu bayar secara digital melalui aplikasi dengan aman.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Ambil atau Donasi</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ambil makananmu langsung di restoran, gunakan jasa kurir, atau donasikan langsung ke Food Bank terdekat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Dampak Kami Section */}
      <section id="dampak" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dampak Nyata Bersama
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Setiap porsi makanan yang terselamatkan adalah langkah besar dalam mengurangi emisi karbon dan membantu sesama yang membutuhkan.
              </p>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <Leaf className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">25K+</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Kg Makanan</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <HeartHandshake className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">18K+</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Porsi Terbagi</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center col-span-2">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">140+</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mitra Restoran & Food Bank</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Untuk Mitra Section */}
      <section id="untuk-mitra" className="py-24 px-4 bg-emerald-500 text-white scroll-mt-20 rounded-3xl mx-4 md:mx-8 mb-12 shadow-xl shadow-emerald-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Punya Usaha Kuliner?
          </h2>
          <p className="text-lg md:text-xl text-emerald-50 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Ubah kerugian akibat makanan berlebih menjadi peluang. Bergabunglah sebagai mitra ResFood, kurangi food waste, dan jangkau lebih banyak pelanggan baru.
          </p>
          <div className="pt-4">
            <Link href="/register?role=restaurant">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-50 rounded-full px-8 h-14 text-base font-bold shadow-lg hover:-translate-y-1 transition-all">
                Daftar Sebagai Mitra
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
