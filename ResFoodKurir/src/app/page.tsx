"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Bike, Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CourierLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 border border-emerald-200 dark:border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Jadilah Pahlawan Penyelamat Makanan</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight mb-6">
          Kirim Kebaikan, <br className="hidden md:block" />
          <span className="text-emerald-500">Selamatkan Bumi</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Bergabunglah sebagai Mitra Kurir ResFood. Bantu distribusikan makanan surplus dari restoran ke tangan mereka yang membutuhkan, dapatkan penghasilan tambahan, dan kurangi jejak karbon.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all">
              Daftar Sebagai Kurir <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
              Masuk ke Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Kenapa Bergabung Dengan Kami?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Lebih dari sekadar mengantar makanan, Anda memberikan dampak positif bagi lingkungan dan masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Waktu Fleksibel</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pilih waktu kerjamu sendiri. Ambil order pengiriman kapan pun Anda siap dan sedang aktif di aplikasi.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <Bike className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Penghasilan Tambahan</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dapatkan tarif pengiriman yang kompetitif beserta insentif tambahan dari misi penyelamatan makanan.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <Leaf className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dampak Lingkungan</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bantu turunkan emisi gas rumah kaca. Setiap kilogram makanan yang diantar berarti emisi karbon yang berhasil dicegah.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
