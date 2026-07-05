"use client";

import React, { useState } from "react";
import { Heart, Landmark, Plus, ArrowRight, ShieldCheck, CheckCircle, Flame, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MockDonationRequest {
  id: string;
  name: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
}

export default function DonorPage() {
  const [requests, setRequests] = useState<MockDonationRequest[]>([
    {
      id: "1",
      name: "Panti Asuhan Kasih Bunda",
      title: "Kebutuhan Roti & Susu Balita",
      description: "Mencari surplus makanan dari bakery atau swalayan berupa roti tawar, kue basah, dan susu balita untuk santapan sore adik-adik panti.",
      target: 50,
      current: 32,
      deadline: "Hari ini, 18:00 WIB",
    },
    {
      id: "2",
      name: "Dapur Umum Kelompok Relawan Ciliwung",
      title: "Bahan Makanan Mentah (Sayuran & Protein)",
      description: "Membutuhkan bahan mentah segar seperti sisa sortiran buah/sayur layak konsumsi dari swalayan atau perkebunan untuk diolah menjadi makanan siap saji warga terdampak banjir.",
      target: 100,
      current: 45,
      deadline: "Besok, 10:00 WIB",
    },
  ]);

  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formTitle || !formTarget) return;

    const newRequest: MockDonationRequest = {
      id: Math.random().toString(),
      name: formName,
      title: formTitle,
      description: formDesc || "Membutuhkan makanan surplus berkualitas baik untuk disalurkan ke penerima manfaat.",
      target: Number(formTarget),
      current: 0,
      deadline: "3 hari lagi",
    };

    setRequests([newRequest, ...requests]);
    setFormName("");
    setFormTitle("");
    setFormDesc("");
    setFormTarget("");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-12 py-6 animate-fade-in">
      
      {/* 1. Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Landmark className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Lembaga Sosial & Food Bank</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Salurkan makanan surplus dalam skala besar dari restoran, supermarket, atau pabrik makanan langsung ke panti asuhan, dapur umum, dan kaum dhuafa melalui jaringan relawan terverifikasi.
        </p>
      </section>

      {/* Grid: Request list and Donation form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active donation requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500/10" /> Kebutuhan Pangan Mendesak
            </h2>
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">
              {requests.length} Lembaga
            </span>
          </div>

          <div className="space-y-6">
            {requests.map((req) => {
              const pct = Math.min(100, Math.floor((req.current / req.target) * 100));
              return (
                <Card key={req.id} className="border-slate-200/60 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {req.title}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {req.name}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-1 sm:mt-0">
                        <Calendar className="w-3.5 h-3.5" /> Batas: {req.deadline}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {req.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400">Pengumpulan:</span>
                        <span className="text-slate-800 dark:text-slate-200">{req.current} / {req.target} Porsi ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Donate Action */}
                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        onClick={() => alert(`Terima kasih atas kepedulian Anda! Anda akan diarahkan untuk mengatur logistik pengiriman bersama kurir relawan ke ${req.name}.`)}
                        className="px-4.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/10 hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white/10" /> Salurkan Makanan
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Side: Request form & volunteer box */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Request Form */}
          <Card className="border-slate-200/60 dark:border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-lg">Ajukan Permintaan Pangan</CardTitle>
              <CardDescription>Khusus untuk lembaga sosial terverifikasi yang membutuhkan donasi pangan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Lembaga</label>
                  <Input
                    placeholder="cth. Panti Asuhan Bahagia"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Judul Kebutuhan</label>
                  <Input
                    placeholder="cth. Kebutuhan 100 Kotak Nasi"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Jumlah Porsi Target</label>
                  <Input
                    type="number"
                    placeholder="cth. 50"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Deskripsi Detail</label>
                  <textarea
                    placeholder="Tuliskan spesifikasi kebutuhan pangan, jam makan panti, dan nomor telepon kontak..."
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                  />
                </div>

                {successMsg && (
                  <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Permintaan berhasil ditambahkan!</span>
                  </div>
                )}

                <Button type="submit" className="w-full flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Ajukan Kebutuhan
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Volunteer courier call-to-action */}
          <Card className="glass border-slate-200/50 dark:border-slate-800/80 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-emerald-500/10" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white">Menjadi Relawan Kurir</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Punya sepeda/motor dan waktu luang? Bantu jemput surplus makanan donasi dari mitra restoran dan kirimkan ke lembaga sosial terdekat. Jadilah pahlawan penyelamat pangan hari ini!
              </p>
              <button
                onClick={() => alert("Terima kasih! Formulir pendaftaran relawan kurir akan segera diproses.")}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
              >
                Gabung Relawan <ArrowRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
