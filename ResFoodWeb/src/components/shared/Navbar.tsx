"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Leaf, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize theme client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll spy and sticky navbar logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Only calculate active section if we're on the landing page
      if (pathname === "/") {
        const sections = ["cara-kerja", "untuk-mitra", "dampak"];
        let current = "";
        
        // Find the section that is currently in view
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Adjust threshold based on your needs. 150px from top is a good spot.
            if (rect.top <= 200 && rect.bottom >= 200) {
              current = section;
            }
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    // If we're on the landing page, prevent default and scroll smoothly
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      }
    }
    // If not on landing page, let the default behavior happen (navigate to /#id)
  };

  const navLinks = [
    { href: "cara-kerja", id: "cara-kerja", label: "Cara Kerja" },
    { href: "untuk-mitra", id: "untuk-mitra", label: "Untuk Mitra" },
    { href: "dampak", id: "dampak", label: "Dampak Kami" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-slate-200 dark:border-slate-800" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - tetap di kiri */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-5 h-5 fill-white/10" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Res<span className="text-emerald-500">Food</span>
            </span>
          </Link>

          {/* Desktop Navigation (Anchor links di tengah) */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`/#${link.href}`}
                    onClick={(e) => handleSmoothScroll(e, link.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Theme Toggle (Di luar hamburger di mobile) */}
            {mounted ? (
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            ) : (
              <div className="w-10 h-10" /> // Placeholder to prevent layout shift
            )}

            {user ? (
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="h-10 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:pl-4 md:border-l md:border-slate-200 dark:border-slate-800">
                <Link
                  href="/login"
                  className="hidden md:flex h-10 px-4 rounded-xl text-sm font-medium text-slate-700 hover:text-emerald-500 dark:text-slate-300 items-center justify-center"
                >
                  Masuk
                </Link>
                {/* Tombol Daftar (Di luar hamburger di mobile) */}
                <Link
                  href="/register"
                  className="h-9 px-4 md:h-10 rounded-xl text-xs md:text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`/#${link.href}`}
                    onClick={(e) => handleSmoothScroll(e, link.id)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-4">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full h-11 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-center text-slate-700 dark:text-slate-200"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <div className="px-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full h-11 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

