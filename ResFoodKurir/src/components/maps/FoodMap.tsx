"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Compass, Landmark, ShoppingBag, ShieldCheck } from "lucide-react";
import { FoodItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface FoodMapProps {
  items: FoodItem[];
  onSelect: (item: FoodItem) => void;
}

export default function FoodMap({ items, onSelect }: FoodMapProps) {
  const [selectedPin, setSelectedPin] = useState<FoodItem | null>(null);

  // Convert coords ratio to map percentage (Jakarta Central coordinates bounds)
  // Latitude bounds: -6.2000 to -6.2200
  // Longitude bounds: 106.8380 to 106.8500
  const getMapPosition = (lat: number, lng: number) => {
    const latMin = -6.2200;
    const latMax = -6.2000;
    const lngMin = 106.8380;
    const lngMax = 106.8500;

    const top = ((latMax - lat) / (latMax - latMin)) * 100;
    const left = ((lng - lngMin) / (lngMax - lngMin)) * 100;

    return {
      top: `${Math.max(10, Math.min(90, top))}%`,
      left: `${Math.max(10, Math.min(90, left))}%`,
    };
  };

  return (
    <div className="relative w-full h-[500px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between">
      
      {/* Background Stylized Map Pattern */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none z-0">
        {/* SVG Street Grid Simulators */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-300 dark:text-slate-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main Diagonal Streets */}
          <path d="M 0 100 Q 200 150 400 300 T 800 450" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-300 dark:text-slate-800" />
          <path d="M 100 0 C 300 200 400 100 600 500" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-300 dark:text-slate-800" />
          <path d="M 0 400 L 800 100" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-300 dark:text-slate-800" />
        </svg>
        {/* Animated user location pulse */}
        <div className="absolute top-[48%] left-[51%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping absolute" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-950" />
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="glass px-3.5 py-2 rounded-xl border border-white/20 shadow-md text-xs font-semibold flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
          <span>Lokasi Anda: Jakarta Selatan</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="glass p-2 rounded-xl border border-white/20 shadow-md flex flex-col gap-1 text-[10px] text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Aktif</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-600 border border-white" /> Lokasi Anda</div>
        </div>
      </div>

      {/* Street Markers (Pins) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {items.map((food) => {
          const pos = getMapPosition(food.latitude, food.longitude);
          const isSelected = selectedPin?.id === food.id;

          return (
            <div
              key={food.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ top: pos.top, left: pos.left }}
            >
              <button
                onClick={() => setSelectedPin(food)}
                className={`relative flex items-center justify-center p-1.5 rounded-full shadow-lg border transition-all duration-300 active:scale-90 ${
                  isSelected
                    ? "bg-amber-500 border-white text-white scale-110 z-20"
                    : "bg-emerald-500 border-white text-white hover:bg-emerald-600 hover:scale-105"
                }`}
                title={food.restaurantName}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-inherit animate-ping absolute -z-10" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Info popups overlay bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
        {selectedPin && (
          <div className="pointer-events-auto glass-card max-w-sm w-full p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-lg flex items-center justify-between gap-4 animate-slide-up">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{selectedPin.category}</p>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{selectedPin.title}</h4>
              <p className="text-xs text-slate-400 font-medium">{selectedPin.restaurantName}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-extrabold text-emerald-500">{formatRupiah(selectedPin.discountPrice)}</span>
                <span className="text-[10px] text-slate-400 line-through">{formatRupiah(selectedPin.originalPrice)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => onSelect(selectedPin)}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition-colors"
              >
                Klaim
              </button>
              <button
                onClick={() => setSelectedPin(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
