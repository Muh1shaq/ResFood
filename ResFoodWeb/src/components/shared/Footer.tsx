import React from "react";
import Link from "next/link";
import { Leaf, Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand details */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white">
                Res<span className="text-emerald-500">Food</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Solusi digital untuk mengurangi pemborosan makanan dengan mendistribusikan makanan surplus secara aman, efisien, dan berdampak sosial.
            </p>
          </div>
          
          {/* Column 2: Fast Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Jelajahi
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Surplus Marketplace
                </Link>
              </li>
              <li>
                <Link href="/donor" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Lembaga Sosial (Food Bank)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Kemitraan Restoran
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Partner benefits */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Kemitraan
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/register?role=restaurant" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Daftar sebagai Mitra Restoran
                </Link>
              </li>
              <li>
                <Link href="/register?role=volunteer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Menjadi Relawan Kurir
                </Link>
              </li>
              <li>
                <Link href="/register?role=foodbank" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  Gabung Komunitas Food Bank
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Hubungi Kami
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Gedung Hijau Lestari Lt. 3, Jakarta Selatan, Indonesia</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>+62 (21) 555-0192</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>kontak@resfood.id</span>
            </div>
          </div>
          
        </div>
        
        {/* Under footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} ResFood Indonesia. Hak Cipta Dilindungi.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> untuk Bumi yang Lebih Baik.
          </p>
        </div>
      </div>
    </footer>
  );
}
