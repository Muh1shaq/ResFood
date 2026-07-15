import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Kurir</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Selamat datang kembali! Anda sedang dalam status Online.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Refresh Pesanan</Button>
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
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Pesanan Tersedia</h2>
        <Card className="p-12 border-dashed border-2 bg-transparent border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada pesanan surplus pangan di area Anda saat ini.</p>
        </Card>
      </div>
    </div>
  );
}
