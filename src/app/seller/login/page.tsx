"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/components/seller-auth-provider";

export default function SellerLoginPage() {
  const { login } = useSellerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const ok = login(email, password);
    if (ok) {
      router.push("/seller");
    } else {
      setError("Nieprawidłowy email lub hasło.");
    }
  }

  function fillDemo() {
    setEmail("sprzedawca@fashionhero.pl");
    setPassword("hero2024");
  }

  return (
    <div className="min-h-screen bg-[#ece9e2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-2xl font-light tracking-widest text-charcoal">FASHIONHERO</span>
          <p className="text-[11px] text-warm-gray mt-1 tracking-wide uppercase">Panel Sprzedawcy</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <h1 className="text-lg font-light text-charcoal mb-6 text-center">Zaloguj się</h1>

          {error && (
            <p className="text-red-600 text-[13px] text-center mb-4 bg-red-50 rounded-lg py-2">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sprzedawca@fashionhero.pl"
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors bg-[#fafafa]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal mb-1.5">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors bg-[#fafafa]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-charcoal text-white text-[12px] font-medium uppercase tracking-[0.8px] py-3 rounded-lg hover:bg-charcoal-light transition-colors mt-2"
            >
              Zaloguj się
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-black/10">
            <p className="text-[11px] text-warm-gray text-center mb-3">Dane demo:</p>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-[13px] font-medium text-charcoal border border-charcoal/30 rounded-lg py-2.5 hover:bg-charcoal hover:text-white transition-colors"
            >
              Uzupełnij dane demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
