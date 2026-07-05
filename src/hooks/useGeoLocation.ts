"use client";

import { useState, useEffect } from "react";

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

// Default to Jakarta central coordinates
const DEFAULT_COORDS = {
  latitude: -6.2088,
  longitude: 106.8456,
};

export function useGeoLocation() {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        latitude: DEFAULT_COORDS.latitude,
        longitude: DEFAULT_COORDS.longitude,
        error: "Geolocation tidak didukung oleh browser ini.",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState({
          latitude: DEFAULT_COORDS.latitude,
          longitude: DEFAULT_COORDS.longitude,
          error: `Gagal mendapatkan lokasi: ${error.message}. Menggunakan koordinat Jakarta.`,
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  return state;
}
