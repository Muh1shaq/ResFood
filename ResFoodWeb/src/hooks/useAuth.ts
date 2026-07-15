"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabaseClient";

// Simulated user storage key
const AUTH_KEY = "resfood_auth_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem(AUTH_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, role: UserRole, password?: string) => {
    setIsLoading(true);
    try {
      const { data: userRow, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;

      if (!userRow) {
        throw new Error("Akun tidak ditemukan. Silakan registrasi terlebih dahulu.");
      }

      if (password && userRow.password !== password) {
        throw new Error("Kata sandi salah.");
      }

      const mockUser: User = {
        id: userRow.id.toString(),
        email: userRow.email,
        name: userRow.name,
        role: userRow.role as UserRole,
        phoneNumber: "+62 812-3456-7890",
        createdAt: userRow.created_at || new Date().toISOString(),
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      setIsLoading(false);
      return mockUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (name: string, email: string, role: UserRole, password?: string) => {
    setIsLoading(true);
    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        throw new Error("Email sudah terdaftar.");
      }

      // Insert new user
      const { data: newUserRow, error: insertError } = await supabase
        .from("users")
        .insert([{ name, email, role, password: password || "password123" }])
        .select()
        .single();

      if (insertError) throw insertError;

      const mockUser: User = {
        id: newUserRow.id.toString(),
        email: newUserRow.email,
        name: newUserRow.name,
        role: newUserRow.role as UserRole,
        phoneNumber: "+62 812-9876-5432",
        createdAt: newUserRow.created_at || new Date().toISOString(),
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      setIsLoading(false);
      return mockUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
