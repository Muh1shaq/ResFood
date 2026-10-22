"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { NotificationItem } from "@/types";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [browserNotificationAllowed, setBrowserNotificationAllowed] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotificationAllowed(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setBrowserNotificationAllowed(perm === "granted");
    }
  };

  const showDesktopNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico"
        });
      } catch (err) {
        console.warn("Desktop notification trigger notice:", err);
      }
    }
  };

  // Fetch notifications from Backend API
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?user_id=${user.id}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setNotifications(result.data);
          setUnreadCount(result.data.filter((n: NotificationItem) => !n.is_read).length);
        }
      }
    } catch (err) {
      // Offline fallback: try direct Supabase
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setNotifications(data as NotificationItem[]);
          setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
      } catch (fallbackErr) {
        // silent
      }
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();

    // Polling fallback every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show desktop push notification
          showDesktopNotification(newNotif.title, newNotif.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      // fallback
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (err) {
      // fallback
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setIsLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PREP_REMINDER":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case "SURPLUS_OPEN":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case "LAST_CALL":
        return (
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isLoading}
                  className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tandai dibaca</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          {!browserNotificationAllowed && (
            <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <span>Izinkan notifikasi desktop untuk alert realtime</span>
              <button
                onClick={requestNotificationPermission}
                className="px-2 py-0.5 font-medium underline hover:text-amber-950 dark:hover:text-amber-100"
              >
                Aktifkan
              </button>
            </div>
          )}

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                    !item.is_read
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {getNotificationIcon(item.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className={`text-xs font-semibold truncate ${
                        !item.is_read 
                          ? "text-slate-900 dark:text-white" 
                          : "text-slate-600 dark:text-slate-300"
                      }`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.data?.url && (
                      <Link
                        href={item.data.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>Buka Halaman</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {!item.is_read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Notifikasi otomatis sesuai jadwal operasional mitra
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
