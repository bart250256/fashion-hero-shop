"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSellerAuth } from "@/components/seller-auth-provider";
import { PromoteProductModal } from "@/components/promote-product-modal";
import { track } from "@/lib/track";

const mockStats = [
  { label: "Przychód (maj)", value: "14 820 zł", change: "+12%", up: true },
  { label: "Zamówienia (maj)", value: "94", change: "+8%", up: true },
  { label: "Produkty aktywne", value: "38", change: "", up: true },
  { label: "Zwroty", value: "3", change: "-2%", up: false },
];

const mockOrders = [
  { id: "#FH-20541", customer: "Marek Wiśniewski", product: "Runner Lite — Szary/42", amount: "349 zł", date: "22 maj 2026", status: "Nowe" },
  { id: "#FH-20540", customer: "Zuzanna Maj", product: "CloudStep Pro — Beż/38", amount: "529 zł", date: "22 maj 2026", status: "Nowe" },
  { id: "#FH-20538", customer: "Piotr Nowak", product: "Urban Trek — Czarny/44", amount: "419 zł", date: "21 maj 2026", status: "W realizacji" },
  { id: "#FH-20535", customer: "Katarzyna Bąk", product: "Soft Walk — Biały/37", amount: "299 zł", date: "20 maj 2026", status: "Wysłane" },
  { id: "#FH-20531", customer: "Tomasz Lewandowski", product: "Runner Lite — Szary/41", amount: "349 zł", date: "19 maj 2026", status: "Wysłane" },
  { id: "#FH-20529", customer: "Aleksandra Duda", product: "CloudStep Pro — Zielony/39", amount: "529 zł", date: "18 maj 2026", status: "Dostarczone" },
  { id: "#FH-20522", customer: "Michał Krawczyk", product: "Urban Trek — Brąz/43", amount: "419 zł", date: "16 maj 2026", status: "Dostarczone" },
];

const mockProducts = [
  { name: "Runner Lite", sku: "RL-GRY", price: "349 zł", views: 1840, viewsChange: 12, sold: 41, image: "/images/products/product-1.jpg" },
  { name: "CloudStep Pro", sku: "CSP-BEZ", price: "529 zł", views: 973, viewsChange: -5, sold: 29, image: "/images/products/product-3.jpg" },
  { name: "Urban Trek", sku: "UT-BLK", price: "419 zł", views: 1205, viewsChange: 8, sold: 18, image: "/images/products/product-5.jpg" },
  { name: "Soft Walk", sku: "SW-WHT", price: "299 zł", views: 2310, viewsChange: 21, sold: 55, image: "/images/products/product-7.jpg" },
  { name: "Trail Boss", sku: "TB-KHK", price: "599 zł", views: 418, viewsChange: -11, sold: 12, image: "/images/products/product-9.jpg" },
];

const revenueWeeks = [
  { week: "28 kwi", value: 2840 },
  { week: "5 maj", value: 3210 },
  { week: "12 maj", value: 2970 },
  { week: "19 maj", value: 3800 },
];
const maxRevenue = Math.max(...revenueWeeks.map((w) => w.value));

const statusColors: Record<string, string> = {
  Nowe: "bg-blue-50 text-blue-700",
  "W realizacji": "bg-amber-50 text-amber-700",
  Wysłane: "bg-purple-50 text-purple-700",
  Dostarczone: "bg-green-50 text-green-700",
};

export default function SellerDashboard() {
  const { seller, logout } = useSellerAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products">("dashboard");

  useEffect(() => {
    if (!seller) router.push("/seller/login");
  }, [seller, router]);

  if (!seller) return null;

  return (
    <div className="min-h-screen bg-[#f5f4f1] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-charcoal min-h-screen flex flex-col py-8 px-5 flex-shrink-0">
        <div className="mb-10">
          <span className="text-white text-sm font-light tracking-widest">FASHIONHERO</span>
          <p className="text-white/40 text-[10px] mt-0.5 tracking-wide">Panel Sprzedawcy</p>
        </div>

        <nav className="space-y-1 flex-1">
          {(["dashboard", "orders", "products"] as const).map((tab) => {
            const labels = { dashboard: "Przegląd", orders: "Zamówienia", products: "Produkty" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-white/60 text-[12px] leading-snug mb-1">{seller.name}</p>
          <p className="text-white/30 text-[11px] mb-4">{seller.store}</p>
          <button
            onClick={() => { logout(); router.push("/seller/login"); }}
            className="text-[11px] text-white/40 hover:text-white transition-colors"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "orders" && <OrdersView />}
        {activeTab === "products" && <ProductsView />}
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-light text-charcoal">Dzień dobry, Anno 👋</h1>
        <p className="text-[13px] text-warm-gray mt-1">Maj 2026 — podsumowanie działalności</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-black/5">
            <p className="text-[11px] text-warm-gray uppercase tracking-wide mb-2">{stat.label}</p>
            <p className="text-2xl font-light text-charcoal">{stat.value}</p>
            {stat.change && (
              <p className={`text-[12px] mt-1 ${stat.up ? "text-green-600" : "text-red-500"}`}>
                {stat.change} vs. kwiecień
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5 mb-8">
        <h2 className="text-[12px] font-medium uppercase tracking-wide text-charcoal mb-6">
          Przychód tygodniowy (zł)
        </h2>
        <div className="flex items-end gap-4 h-32">
          {revenueWeeks.map((w) => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-[12px] text-charcoal font-medium">{w.value.toLocaleString("pl")}</p>
              <div
                className="w-full bg-charcoal rounded-t-md transition-all"
                style={{ height: `${(w.value / maxRevenue) * 80}px` }}
              />
              <p className="text-[11px] text-warm-gray">{w.week}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-charcoal">
            Ostatnie zamówienia
          </h2>
          <span className="text-[11px] text-warm-gray">{mockOrders.length} zamówień</span>
        </div>
        <div className="divide-y divide-black/4">
          {mockOrders.slice(0, 5).map((order) => (
            <div key={order.id} className="px-6 py-3.5 flex items-center gap-4">
              <span className="text-[12px] text-warm-gray w-20 flex-shrink-0">{order.id}</span>
              <span className="text-[13px] text-charcoal flex-1">{order.customer}</span>
              <span className="text-[12px] text-warm-gray flex-1 hidden md:block">{order.product}</span>
              <span className="text-[13px] font-medium text-charcoal w-20 text-right">{order.amount}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium w-24 text-center ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrdersView() {
  const [filter, setFilter] = useState("Wszystkie");
  const statuses = ["Wszystkie", "Nowe", "W realizacji", "Wysłane", "Dostarczone"];

  const filtered = filter === "Wszystkie"
    ? mockOrders
    : mockOrders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-light text-charcoal">Zamówienia</h1>
        <p className="text-[13px] text-warm-gray mt-1">Wszystkie zamówienia z Twojego sklepu</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-[12px] transition-colors ${
              filter === s
                ? "bg-charcoal text-white"
                : "bg-white text-warm-gray border border-black/10 hover:border-charcoal hover:text-charcoal"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="divide-y divide-black/4">
          {filtered.map((order) => (
            <div key={order.id} className="px-6 py-4 flex items-center gap-4">
              <span className="text-[12px] text-warm-gray w-24 flex-shrink-0">{order.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-charcoal font-medium">{order.customer}</p>
                <p className="text-[12px] text-warm-gray truncate">{order.product}</p>
              </div>
              <span className="text-[12px] text-warm-gray hidden md:block">{order.date}</span>
              <span className="text-[13px] font-medium text-charcoal w-20 text-right">{order.amount}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium w-24 text-center flex-shrink-0 ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsView() {
  const [promoteSku, setPromoteSku] = useState<string | null>(null);
  const activeProduct = mockProducts.find((p) => p.sku === promoteSku) ?? null;

  function openPromote(p: (typeof mockProducts)[number]) {
    track("promote_button_click", { sku: p.sku, productName: p.name });
    setPromoteSku(p.sku);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light text-charcoal">Produkty</h1>
          <p className="text-[13px] text-warm-gray mt-1">Twoje aktywne oferty</p>
        </div>
        <button className="bg-charcoal text-white text-[12px] font-medium uppercase tracking-wide px-5 py-2.5 rounded-lg hover:bg-charcoal-light transition-colors">
          + Dodaj produkt
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="px-6 py-3 border-b border-black/5 grid gap-4 items-center" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
          {["Produkt", "SKU", "Cena", "Wyświetlenia", "Promocja"].map((h) => (
            <span key={h} className="text-[11px] font-medium uppercase tracking-wide text-warm-gray">
              {h}
            </span>
          ))}
        </div>
        <div className="divide-y divide-black/4">
          {mockProducts.map((p) => (
            <div key={p.sku} className="px-6 py-3 grid gap-4 items-center" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#ece9e2] flex-shrink-0">
                  <Image src={p.image} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <span className="text-[13px] text-charcoal font-medium">{p.name}</span>
              </div>
              <span className="text-[12px] text-warm-gray font-mono">{p.sku}</span>
              <span className="text-[13px] text-charcoal">{p.price}</span>
              <span className="text-[13px] text-charcoal">
                {p.views.toLocaleString("pl")}{" "}
                <span className={`text-[12px] font-medium ${p.viewsChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  ({p.viewsChange >= 0 ? "+" : ""}{p.viewsChange}%)
                </span>
              </span>
              <button
                type="button"
                onClick={() => openPromote(p)}
                aria-label="Promuj produkty — wkrótce — kliknij aby dowiedzieć się więcej"
                title="kliknij aby dowiedzieć się więcej"
                className="bg-charcoal text-white text-[11px] font-medium uppercase tracking-wide px-3 py-2 rounded-lg hover:bg-charcoal-light transition-colors text-left leading-tight"
              >
                Promuj produkty — wkrótce
              </button>
            </div>
          ))}
        </div>
      </div>

      <PromoteProductModal
        open={activeProduct !== null}
        productName={activeProduct?.name ?? ""}
        sku={activeProduct?.sku ?? ""}
        onClose={() => setPromoteSku(null)}
      />
    </div>
  );
}
