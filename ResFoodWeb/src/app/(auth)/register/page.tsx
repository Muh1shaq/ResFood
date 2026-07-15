"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, Mail, Lock, CheckCircle, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && ["customer", "restaurant", "foodbank", "volunteer"].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email || !password) {
      setError("Seluruh kolom formulir wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);
      await register(name, email, role, password);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = role === "restaurant" || role === "foodbank" ? "/dashboard" : "/marketplace";
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Gagal membuat akun.");
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: "customer", label: "Masyarakat/Pembeli" },
    { value: "restaurant", label: "Restoran/Mitra" },
    { value: "foodbank", label: "Lembaga Sosial" },
    { value: "volunteer", label: "Kurir Relawan" },
  ];

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <Card className="border-slate-200/60 dark:border-slate-800/80 shadow-xl shadow-slate-200/20 dark:shadow-none">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold tracking-tight font-sans">Buat Akun Baru</CardTitle>
          <CardDescription>Bergabung dengan ResFood & mulai gerakan selamatkan pangan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Roles Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Daftar Sebagai
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      role === r.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nama Lengkap / Nama Instansi
              </label>
              <Input
                type="text"
                placeholder="cth. Budi Setiawan / Resto Lezat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Alamat Email
              </label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kata Sandi Baru
              </label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 animate-pulse-subtle">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Akun berhasil didaftarkan! Mengarahkan...</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 flex items-center justify-center gap-2"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...
                </>
              ) : (
                <>
                  Daftar Akun Baru <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800/60 pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-500 hover:text-emerald-600"
            >
              Masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
