"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Bell, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              ResFood <span className="text-emerald-500 font-medium">Kurir</span>
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Online</span>
            </div>
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-800">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
