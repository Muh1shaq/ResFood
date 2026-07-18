"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Package, Clock, Navigation, CheckCircle, Smartphone } from "lucide-react";

export default function DashboardPage() {
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Mock Order State
  const [orderStatus, setOrderStatus] = useState<"none" | "assigned" | "picked_up">("none");
  const [deliveryPin, setDeliveryPin] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Simulate receiving an order after becoming active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      // Start GPS tracking (mock sending to backend)
      interval = setInterval(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            console.log("GPS Terkirim:", pos.coords.latitude, pos.coords.longitude);
          });
        }
      }, 10000); // 10 detik

      // Simulate getting an order after 3 seconds of being active (if no order currently)
      if (orderStatus === "none") {
        setTimeout(() => setOrderStatus("assigned"), 3000);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, orderStatus]);

  const handleCompleteOrder = () => {
    setValidationError(null);
    if (!deliveryPin) {
      setValidationError("Masukkan PIN Penyelesaian");
      return;
    }
    
    // Validasi GPS (Simulasi)
    if (!location) {
      setValidationError("Gagal mendapatkan lokasi GPS saat ini");
      return;
    }

    // Simulasi memanggil backend /api/orders/:id/complete
    // Anggap selalu berhasil jika PIN diisi untuk demo ini, 
    // pada realitasnya ini divalidasi oleh jarak Haversine di backend.
    if (deliveryPin.length === 6) {
      alert("Pesanan berhasil diselesaikan! Validasi lokasi GPS dan PIN berhasil.");
      setOrderStatus("none");
      setDeliveryPin("");
    } else {
      setValidationError("PIN harus 6 digit angka");
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Kurir</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isActive ? "Anda sedang aktif menerima pesanan. Sistem melacak GPS Anda." : "Anda sedang offline."}
          </p>
        </div>
        <Button 
          onClick={() => setIsActive(!isActive)}
          className={isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}
        >
          {isActive ? "Berhenti Bekerja" : "Mulai Bekerja"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" /> Pengiriman Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">12</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Pesanan Aktif</h2>
        
        {orderStatus === "none" ? (
          <Card className="p-12 border-dashed border-2 bg-transparent border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isActive ? "Mencari pesanan terdekat di sekitar Anda..." : "Aktifkan status bekerja untuk mulai menerima pesanan."}
            </p>
          </Card>
        ) : (
          <Card className="border-emerald-500/20 shadow-md">
            <CardHeader className="bg-emerald-500/5 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
                  <Navigation className="w-5 h-5 animate-pulse" /> 
                  {orderStatus === "assigned" ? "Menuju Restoran" : "Menuju Pembeli"}
                </CardTitle>
                <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-800 rounded shadow-sm">
                  ORD-4921
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Pickup Section */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-sm">Ambil Makanan</h4>
                    <p className="text-xs text-slate-500">Bakery Aroma Indah - Jakarta Selatan</p>
                  </div>
                </div>
                
                {orderStatus === "assigned" && (
                  <div className="ml-11 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      Tunjukkan PIN ini ke kasir untuk mengambil pesanan:
                    </p>
                    <div className="font-mono text-2xl font-extrabold tracking-[0.2em] text-center text-amber-600">
                      592104
                    </div>
                    <Button onClick={() => setOrderStatus("picked_up")} className="w-full mt-3 bg-amber-500 hover:bg-amber-600">
                      Pesanan Sudah Diambil
                    </Button>
                  </div>
                )}
              </div>

              {/* Delivery Section */}
              <div className={`space-y-3 ${orderStatus === "assigned" ? "opacity-40" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-sm">Antar ke Pembeli</h4>
                    <p className="text-xs text-slate-500">Budi Santoso - Jl. Jendral Sudirman No. 12</p>
                  </div>
                </div>

                {orderStatus === "picked_up" && (
                  <div className="ml-11 space-y-3 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs font-semibold">Validasi Penyelesaian Pesanan</p>
                    <p className="text-[11px] text-slate-500">
                      Mintalah PIN dari pembeli untuk memastikan makanan diterima oleh orang yang tepat. Sistem juga akan memvalidasi GPS Anda berada di titik antar.
                    </p>
                    
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-slate-500">PIN DARI PEMBELI (6 DIGIT)</label>
                      <Input 
                        placeholder="Contoh: 123456" 
                        value={deliveryPin} 
                        onChange={(e) => setDeliveryPin(e.target.value)}
                        className="font-mono tracking-widest text-lg h-12"
                        maxLength={6}
                      />
                    </div>

                    {validationError && <p className="text-xs text-red-500 font-semibold">{validationError}</p>}

                    <Button onClick={handleCompleteOrder} className="w-full flex items-center gap-2 h-12">
                      <CheckCircle className="w-4 h-4" /> Selesaikan Pesanan
                    </Button>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
