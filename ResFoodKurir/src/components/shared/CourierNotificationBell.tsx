"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Sparkles, CheckCheck, Clock, X, ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const bellBadgeVariants = cva(
  "absolute flex items-center justify-center rounded-full text-white font-bold transition-all",
  {
    variants: {
      intent: {
        danger: "bg-rose-500 shadow-sm shadow-rose-500/30",
        alert: "bg-emerald-500 shadow-sm shadow-emerald-500/30",
      },
      size: {
        default: "top-1.5 right-1.5 h-4 min-w-4 px-1 text-[10px]",
        large: "top-1 right-1 h-5 min-w-5 px-1.5 text-xs",
      },
    },
    defaultVariants: {
      intent: "danger",
      size: "default",
    },
  }
);

export interface NotificationItem {
  id: string;
  user_id: string;
  role_target: string;
  merchant_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export default function CourierNotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Kurir default ID: '4' (Hendra Saputra di seed data)
  const courierId = "4";

  const fetchCourierNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?user_id=${courierId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
          setUnreadCount(json.data.filter((n: NotificationItem) => !n.is_read).length);
        }
      }
    } catch (err) {
      // Direct Supabase fallback
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", courierId)
          .order("created_at", { ascending: false });

        if (data) {
          setNotifications(data as NotificationItem[]);
          setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
      } catch (e) {
        // silent
      }
    }
  };

  useEffect(() => {
    fetchCourierNotifications();
    const interval = setInterval(fetchCourierNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Supabase Realtime for Courier
  useEffect(() => {
    const channel = supabase
      .channel(`courier-notifications-${courierId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${courierId}`,
        },
        (payload: any) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Click outside to close
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

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      // silent
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: courierId }),
      });
    } catch (err) {
      // silent
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifikasi Kurir"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={bellBadgeVariants({ intent: "danger" })}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Notifikasi Kurir
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {unreadCount} order baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 flex items-center gap-1 transition-colors"
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

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Belum ada notifikasi sesi surplus di area Anda</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`p-3.5 flex gap-3 cursor-pointer transition-colors ${
                    !item.is_read
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50/80"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className={`text-xs font-semibold truncate ${
                        !item.is_read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                      }`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        Baru
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.is_read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
