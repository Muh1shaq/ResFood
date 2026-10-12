"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, X, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
  title?: string;
  description?: string;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  redirectPath = "/marketplace",
  title = "Masuk untuk Menjelajahi Makanan",
  description = "Anda perlu masuk atau mendaftar akun terlebih dahulu untuk melihat dan menyelamatkan surplus makanan terdekat di sekitar Anda.",
}: AuthRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleRegister = () => {
    onClose();
    router.push(`/register?redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center pt-8 pb-3 px-6 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-8 space-y-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleLogin}
              className="w-full sm:flex-1 h-11 flex items-center justify-center gap-2 font-semibold"
            >
              Masuk <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleRegister}
              className="w-full sm:flex-1 h-11 flex items-center justify-center gap-2 font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <UserPlus className="w-4 h-4" /> Daftar
            </Button>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
          >
            Nanti saja
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
