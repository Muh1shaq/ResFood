"use client";

import React, { useState } from "react";
import { MapPin, X, Loader2, AlertTriangle, RefreshCw, Compass, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (coords: { latitude: number; longitude: number }) => void;
}

export default function LocationPermissionModal({
  isOpen,
  onClose,
  onSuccess,
}: LocationPermissionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<"denied" | "timeout" | "unsupported" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestLocation = () => {
    setErrorType(null);
    setErrorMessage(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorType("unsupported");
      setErrorMessage("Browser Anda tidak mendukung fitur geolokasi.");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        onSuccess(coords);
      },
      (error) => {
        setIsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorType("denied");
          setErrorMessage(
            "Akses lokasi diblokir atau ditolak oleh peramban (browser)."
          );
        } else if (error.code === error.TIMEOUT) {
          setErrorType("timeout");
          setErrorMessage("Waktu permintaan lokasi habis (timeout). Silakan periksa GPS dan koneksi internet Anda.");
        } else {
          setErrorType("error");
          setErrorMessage("Gagal mendeteksi lokasi saat ini. Silakan coba kembali.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDeny = () => {
    setErrorType(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl relative">
        <button
          onClick={handleDeny}
          aria-label="Tutup modal"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center pt-8 pb-3 px-6 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <MapPin className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Izinkan Akses Lokasi
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-8 space-y-5 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            ResFood memerlukan izin akses lokasi untuk menampilkan rekomendasi surplus makanan terdekat dalam radius 5 km dari tempat Anda.
          </p>

          {/* Error / Guide Box when permission denied */}
          {errorType === "denied" && (
            <div className="text-left bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2.5 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Izin Lokasi Diblokir di Browser</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Untuk mengaktifkannya kembali:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Klik ikon <strong>Gembok / Pengaturan Situs</strong> di kiri bilah URL (address bar).</li>
                <li>Ubah setelan <strong>Lokasi</strong> menjadi <strong>Izinkan (Allow)</strong>.</li>
                <li>Klik tombol <strong>Coba Lagi</strong> di bawah.</li>
              </ol>
            </div>
          )}

          {/* Other errors (timeout, unsupported, generic) */}
          {errorType && errorType !== "denied" && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="w-full sm:flex-1 h-11 flex items-center justify-center gap-2 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendeteksi...
                </>
              ) : errorType ? (
                <>
                  <RefreshCw className="w-4 h-4" /> Coba Lagi
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" /> Terima
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={isLoading}
              className="w-full sm:flex-1 h-11 flex items-center justify-center gap-2 font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              Tolak
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
