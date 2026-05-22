"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SellerUser {
  name: string;
  email: string;
  store: string;
}

interface SellerAuthContextValue {
  seller: SellerUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const SellerAuthContext = createContext<SellerAuthContextValue | null>(null);

const STORAGE_KEY = "fashionhero_seller";

const VALID_CREDENTIALS = {
  email: "sprzedawca@fashionhero.pl",
  password: "hero2024",
};

const SELLER_PROFILE: SellerUser = {
  name: "Anna Kowalska",
  email: "sprzedawca@fashionhero.pl",
  store: "ShoeCraft Studio",
};

export function SellerAuthProvider({ children }: { children: React.ReactNode }) {
  const [seller, setSeller] = useState<SellerUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSeller(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SELLER_PROFILE));
      setSeller(SELLER_PROFILE);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSeller(null);
  }, []);

  return (
    <SellerAuthContext.Provider value={{ seller, login, logout }}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const ctx = useContext(SellerAuthContext);
  if (!ctx) throw new Error("useSellerAuth must be used within SellerAuthProvider");
  return ctx;
}
