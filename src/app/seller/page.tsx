"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSellerAuth } from "@/components/seller-auth-provider";
import { categoryMedians, conversionVsCategory, trendingNow, proPreviewSeries } from "@/data/pricing-insights";
import { logProCommitment, type SellerIdentity } from "@/lib/pro-commitments";

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
  { name: "Runner Lite", sku: "RL-GRY", price: "349 zł", stock: 23, sold: 41, image: "/images/products/product-1.jpg" },
  { name: "CloudStep Pro", sku: "CSP-BEZ", price: "529 zł", stock: 8, sold: 29, image: "/images/products/product-3.jpg" },
  { name: "Urban Trek", sku: "UT-BLK", price: "419 zł", stock: 15, sold: 18, image: "/images/products/product-5.jpg" },
  { name: "Soft Walk", sku: "SW-WHT", price: "299 zł", stock: 31, sold: 55, image: "/images/products/product-7.jpg" },
  { name: "Trail Boss", sku: "TB-KHK", price: "599 zł", stock: 4, sold: 12, image: "/images/products/product-9.jpg" },
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

// Klucz localStorage — okno o nowej funkcji „Ceny i popyt" pokazujemy raz na sprzedawcę.
const FEATURE_ANNOUNCEMENT_KEY = "fashionhero_seen_pricing_announcement";

export default function SellerDashboard() {
  const { seller, logout } = useSellerAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "pricing">("dashboard");
  // Okno o nowej funkcji „Ceny i popyt” pokazujemy raz na sprzedawcę. Sprawdzamy
  // localStorage przy montowaniu; renderujemy je dopiero gdy seller jest zalogowany.
  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(FEATURE_ANNOUNCEMENT_KEY);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!seller) router.push("/seller/login");
  }, [seller, router]);

  const dismissAnnouncement = () => {
    try {
      localStorage.setItem(FEATURE_ANNOUNCEMENT_KEY, "1");
    } catch {
      // ignore
    }
    setShowAnnouncement(false);
  };

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
          {(["dashboard", "orders", "products", "pricing"] as const).map((tab) => {
            const labels = { dashboard: "Przegląd", orders: "Zamówienia", products: "Produkty", pricing: "Ceny i popyt" };
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
        {activeTab === "pricing" && <PricingView seller={seller} />}
      </main>

      {showAnnouncement && seller && (
        <FeatureAnnouncementModal
          onExplore={() => {
            setActiveTab("pricing");
            dismissAnnouncement();
          }}
          onClose={dismissAnnouncement}
        />
      )}
    </div>
  );
}

/**
 * Okno powitalne po zalogowaniu — informuje sprzedawcę o nowej zakładce
 * „Ceny i popyt". CTA przenosi go bezpośrednio do tej zakładki (góra lejka
 * walidacji popytu z docs/pro-pricing-experiment.md).
 */
function FeatureAnnouncementModal({
  onExplore,
  onClose,
}: {
  onExplore: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-auto">
        {/* Kolorowy pasek nagłówka — spójny z kafelkami Pro */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)" }}
        />
        <div className="px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal bg-[#ece9e2] px-2 py-0.5 rounded">
              Nowość
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray hover:text-charcoal text-[20px] leading-none -mt-1"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-[18px] font-medium text-charcoal mb-2">
            Poznaj „Ceny i popyt” 📈
          </h2>
          <p className="text-[13px] text-warm-gray leading-relaxed mb-4">
            Nowa zakładka w Twoim panelu pokazuje, jak Twoje ceny wypadają na tle
            kategorii i co kupujący wybierają teraz — na danych z rynku FashionHero.
          </p>

          <ul className="space-y-2 mb-6">
            {[
              "Mediana cen kategorii — czy nie sprzedajesz za tanio lub za drogo",
              "Twój współczynnik konwersji vs kategoria",
              "Co teraz kupują — rosnący popyt z ostatnich 7 dni",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-charcoal">
                <span className="text-green-600 mt-0.5" aria-hidden>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onExplore}
            className="w-full bg-charcoal text-white text-[12px] font-medium uppercase tracking-wide px-5 py-3 rounded-lg hover:bg-charcoal-light transition-colors"
          >
            Zobacz „Ceny i popyt”
          </button>
          <button
            onClick={onClose}
            className="w-full text-[12px] text-warm-gray hover:text-charcoal transition-colors mt-3"
          >
            Może później
          </button>
        </div>
      </div>
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
          {["Produkt", "SKU", "Cena", "Stan magazynowy", "Sprzedano"].map((h) => (
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
              <span className={`text-[13px] font-medium ${p.stock <= 5 ? "text-red-600" : "text-charcoal"}`}>
                {p.stock} szt.{p.stock <= 5 && " ⚠"}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 bg-[#ece9e2] rounded-full flex-1 max-w-[60px]">
                  <div
                    className="h-full bg-charcoal rounded-full"
                    style={{ width: `${Math.min((p.sold / 60) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[12px] text-warm-gray">{p.sold}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Vivid accent palette for the pricing charts (from / to gradient stops). */
const CHART_COLORS: { from: string; to: string }[] = [
  { from: "#6366f1", to: "#a855f7" }, // indigo → violet
  { from: "#10b981", to: "#34d399" }, // emerald
  { from: "#f59e0b", to: "#fb923c" }, // amber → orange
  { from: "#ec4899", to: "#f472b6" }, // pink
  { from: "#0ea5e9", to: "#22d3ee" }, // sky → cyan
  { from: "#ef4444", to: "#f87171" }, // red
];

/** Colorful SVG line+area sparkline with gradient fill and an end-point dot. */
function Sparkline({
  data,
  id,
  from,
  to,
  className = "",
}: {
  data: number[];
  id: string;
  from: string;
  to: string;
  className?: string;
}) {
  const w = 100;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const coords = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }));
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = coords[coords.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity={0.35} />
          <stop offset="100%" stopColor={to} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`stroke-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#fill-${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={`url(#stroke-${id})`}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r={3.5} fill={to} stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const PRO_FEATURES = [
  {
    name: "Trendy 90 dni",
    desc: "Wykres trendów cen i popytu z ostatnich 90 dni.",
    preview: "+18% popyt · szczyt: 12 maj",
  },
  {
    name: "Pełna baza 2,4 mln kupujących",
    desc: "Mediany i CR liczone na pełnej próbie, nie na danych demo.",
    preview: "2 412 905 profili kupujących",
  },
  {
    name: "Rekomendacje cen",
    desc: "Sugerowana cena optymalna dla każdego produktu vs konkurencja.",
    preview: "Runner Lite → 369 zł (+20 zł)",
  },
  {
    name: "Alerty cenowe",
    desc: "Powiadomienie, gdy konkurencja zmienia cenę produktu.",
    preview: "3 zmiany cen w Twojej kategorii",
  },
];

function PricingView({ seller }: { seller: SellerIdentity }) {
  const [activateFeature, setActivateFeature] = useState<string | null>(null);

  const maxCR = Math.max(
    ...conversionVsCategory.flatMap((r) => [r.yourCR, r.categoryCR]),
  );
  const maxPrice = Math.max(
    ...categoryMedians.flatMap((c) => [c.yourPrice, c.medianPrice]),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-light text-charcoal">Ceny i popyt</h1>
        <p className="text-[13px] text-warm-gray mt-1">
          Pozycja Twoich cen na tle kategorii (dane demo)
        </p>
      </div>

      {/* Darmowy tier — 3 widoki */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        {/* 1. Mediana cen kategorii */}
        <div className="bg-white rounded-2xl p-5 border border-black/5">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-charcoal mb-1">
            Mediana cen kategorii
          </h2>
          <p className="text-[11px] text-warm-gray mb-5">Twoja cena vs mediana</p>
          <div className="space-y-4">
            {categoryMedians.map((c, i) => (
              <div key={c.category}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[13px] text-charcoal">{c.category}</span>
                  <span className={`text-[12px] font-medium ${c.delta > 0 ? "text-red-500" : "text-green-600"}`}>
                    {c.delta > 0 ? "+" : ""}{c.delta}%
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-[#ece9e2] rounded-full flex-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.yourPrice / maxPrice) * 100}%`,
                          backgroundImage: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length].from}, ${CHART_COLORS[i % CHART_COLORS.length].to})`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-charcoal font-medium w-14 text-right">{c.yourPrice.toLocaleString("pl")} zł</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-[#ece9e2] rounded-full flex-1">
                      <div className="h-full bg-warm-gray/50 rounded-full" style={{ width: `${(c.medianPrice / maxPrice) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-warm-gray w-14 text-right">{c.medianPrice.toLocaleString("pl")} zł</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-black/5">
            <span className="flex items-center gap-1.5 text-[11px] text-warm-gray">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundImage: "linear-gradient(90deg, #6366f1, #ec4899)" }} /> Twoja cena
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-warm-gray">
              <span className="w-2.5 h-2.5 rounded-sm bg-warm-gray/50" /> Mediana
            </span>
          </div>
        </div>

        {/* 2. CR vs kategoria */}
        <div className="bg-white rounded-2xl p-5 border border-black/5">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-charcoal mb-1">
            CR vs kategoria
          </h2>
          <p className="text-[11px] text-warm-gray mb-5">Twój współczynnik konwersji</p>
          <div className="space-y-4">
            {conversionVsCategory.map((r) => (
              <div key={r.category}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[13px] text-charcoal">{r.category}</span>
                  <span className={`text-[12px] font-medium ${r.yourCR >= r.categoryCR ? "text-green-600" : "text-red-500"}`}>
                    {r.yourCR.toLocaleString("pl")}% vs {r.categoryCR.toLocaleString("pl")}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-[#ece9e2] rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(r.yourCR / maxCR) * 100}%`,
                        backgroundImage: "linear-gradient(90deg, #10b981, #34d399)",
                      }}
                    />
                  </div>
                  <div className="h-2 bg-[#ece9e2] rounded-full">
                    <div className="h-full bg-warm-gray/40 rounded-full" style={{ width: `${(r.categoryCR / maxCR) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-black/5">
            <span className="flex items-center gap-1.5 text-[11px] text-warm-gray">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundImage: "linear-gradient(90deg, #10b981, #34d399)" }} /> Twój CR
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-warm-gray">
              <span className="w-2.5 h-2.5 rounded-sm bg-warm-gray/40" /> Kategoria
            </span>
          </div>
        </div>

        {/* 3. Co teraz kupują */}
        <div className="bg-white rounded-2xl p-5 border border-black/5">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-charcoal mb-1">
            Co teraz kupują
          </h2>
          <p className="text-[11px] text-warm-gray mb-5">Wzrost popytu (7 dni)</p>
          <div className="space-y-3">
            {trendingNow.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#ece9e2] flex-shrink-0">
                  <Image src={p.image} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-charcoal font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-warm-gray truncate">{p.category}</p>
                </div>
                <Sparkline
                  data={p.trend}
                  id={`trend-${i}`}
                  from={CHART_COLORS[i % CHART_COLORS.length].from}
                  to={CHART_COLORS[i % CHART_COLORS.length].to}
                  className="w-16 h-8 flex-shrink-0"
                />
                <span
                  className="text-[12px] font-semibold flex-shrink-0 w-10 text-right"
                  style={{ color: CHART_COLORS[i % CHART_COLORS.length].to }}
                >
                  +{p.demandGrowth}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sekcja Pro — zablokowane */}
      <div className="mb-5 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-[15px] font-medium text-charcoal">FashionHero Pro</h2>
          <p className="text-[12px] text-warm-gray mt-0.5">
            Pełne dane z bazy 2,4 mln kupujących i rekomendacje cen
          </p>
        </div>
        <span className="text-[13px] font-medium text-charcoal bg-[#ece9e2] px-3 py-1 rounded-full">
          199 zł/mies
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRO_FEATURES.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setActivateFeature(f.name)}
            className="group relative text-left bg-white rounded-2xl p-5 border border-black/5 overflow-hidden hover:border-charcoal/20 transition-colors"
          >
            <span
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length].from}, ${CHART_COLORS[i % CHART_COLORS.length].to})` }}
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal bg-[#ece9e2] px-2 py-0.5 rounded">
                Pro
              </span>
              <span className="text-[16px]" aria-hidden>🔒</span>
            </div>
            <h3 className="text-[14px] font-medium text-charcoal mb-1">{f.name}</h3>
            <p className="text-[12px] text-warm-gray mb-3">{f.desc}</p>
            <div className="relative rounded-lg bg-[#ece9e2]/60 px-3 pt-3 pb-2 mb-3 overflow-hidden">
              <Sparkline
                data={proPreviewSeries[f.name]}
                id={`pro-${i}`}
                from={CHART_COLORS[i % CHART_COLORS.length].from}
                to={CHART_COLORS[i % CHART_COLORS.length].to}
                className="w-full h-14 blur-[2px] select-none"
              />
              <p className="text-[11px] text-charcoal/60 font-medium blur-[2px] select-none mt-1" aria-hidden>
                {f.preview}
              </p>
            </div>
            <span className="inline-block text-[12px] font-medium text-charcoal underline underline-offset-2">
              Odblokuj za 199 zł/mies →
            </span>
          </button>
        ))}
      </div>

      {activateFeature && (
        <ActivateProModal
          feature={activateFeature}
          seller={seller}
          onClose={() => setActivateFeature(null)}
        />
      )}
    </div>
  );
}

function ActivateProModal({
  feature,
  seller,
  onClose,
}: {
  feature: string;
  seller: SellerIdentity;
  onClose: () => void;
}) {
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = card.replace(/\s/g, "");
    if (digits.length !== 16) return setError("Podaj 16-cyfrowy numer karty.");
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError("Data ważności w formacie MM/RR.");
    if (cvc.replace(/\D/g, "").length < 3) return setError("Podaj 3-cyfrowy kod CVC.");
    if (name.trim().length < 3) return setError("Podaj imię i nazwisko z karty.");

    logProCommitment(seller, feature, digits.slice(-4));
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-auto">
        <div className="px-6 py-5 border-b border-black/5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-medium text-charcoal">Aktywuj Pro</h2>
            <p className="text-[13px] text-warm-gray mt-0.5">
              199 zł/mies · odblokowuje „{feature}”
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray hover:text-charcoal text-[20px] leading-none -mt-1"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="px-6 py-8 text-center">
            <div className="text-[32px] mb-3" aria-hidden>✓</div>
            <h3 className="text-[15px] font-medium text-charcoal mb-2">
              Dziękujemy — zapisaliśmy Twoje zgłoszenie
            </h3>
            <p className="text-[13px] text-warm-gray mb-6">
              Twoja karta została zapisana w trybie setup, bez obciążenia.
              Damy znać mailowo, gdy Pro będzie gotowe.
            </p>
            <button
              onClick={onClose}
              className="bg-charcoal text-white text-[12px] font-medium uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-charcoal-light transition-colors"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5">
            <div className="bg-[#ece9e2] rounded-lg px-4 py-3 mb-5">
              <p className="text-[12px] text-charcoal leading-snug">
                <strong>Tryb setup</strong> — karta zostanie zapisana bez obciążenia.
                Nie pobieramy teraz żadnych środków.
              </p>
            </div>

            <label className="block mb-4">
              <span className="text-[11px] font-medium uppercase tracking-wide text-warm-gray">Numer karty</span>
              <input
                inputMode="numeric"
                value={card}
                onChange={(e) => setCard(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-[14px] text-charcoal focus:border-charcoal outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-warm-gray">Ważność</span>
                <input
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/RR"
                  className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-[14px] text-charcoal focus:border-charcoal outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-warm-gray">CVC</span>
                <input
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-[14px] text-charcoal focus:border-charcoal outline-none"
                />
              </label>
            </div>

            <label className="block mb-5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-warm-gray">Imię i nazwisko z karty</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jan Kowalski"
                className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-[14px] text-charcoal focus:border-charcoal outline-none"
              />
            </label>

            {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-charcoal text-white text-[12px] font-medium uppercase tracking-wide px-5 py-3 rounded-lg hover:bg-charcoal-light transition-colors"
            >
              Zapisz kartę — bez obciążenia
            </button>
            <p className="text-[11px] text-warm-gray text-center mt-3">
              Zero opłat dziś. Zobowiązanie 199 zł/mies po uruchomieniu Pro.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
