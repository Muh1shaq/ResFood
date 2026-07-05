"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/types";

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

  const login = async (email: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      role,
      phoneNumber: "+62 812-3456-7890",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
    return mockUser;
  };

  const register = async (name: string, email: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      name,
      role,
      phoneNumber: "+62 812-9876-5432",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
    return mockUser;
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
