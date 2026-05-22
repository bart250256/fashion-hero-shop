"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "./icons";
import { track } from "@/lib/track";

interface PromoteProductModalProps {
  open: boolean;
  productName: string;
  sku: string;
  onClose: () => void;
}

const BUDGETS = ["do 200 zł", "200–500 zł", "500–1000 zł", "1000+ zł"] as const;
const VISIBILITY = [
  "Wyniki wyszukiwania",
  "Strona główna / Polecane",
  "Strony kategorii",
  "Newsletter",
] as const;

type Budget = (typeof BUDGETS)[number];
type Visibility = (typeof VISIBILITY)[number];

export function PromoteProductModal({ open, productName, sku, onClose }: PromoteProductModalProps) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [visibility, setVisibility] = useState<Visibility[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setBudget(null);
      setVisibility([]);
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  function toggleVisibility(v: Visibility) {
    setVisibility((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function handleSubmit() {
    if (!budget || visibility.length === 0) return;
    track("promote_form_submit", { sku, productName, budget, visibility });
    setSubmitted(true);
  }

  const canSubmit = budget !== null && visibility.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Promuj produkt ${productName}`}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto outline-none"
      >
        <button
          onClick={onClose}
          aria-label="Zamknij"
          className="absolute top-4 right-4 p-1 text-warm-gray hover:text-charcoal transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-8 pt-12 text-center">
            <h2 className="text-lg font-light text-charcoal mb-3">Dziękujemy!</h2>
            <p className="text-[13px] text-warm-gray leading-relaxed">
              Dziękujemy za wysłanie formularza. Wkrótce skontaktujemy się z Tobą.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-charcoal text-white text-[12px] font-medium uppercase tracking-wide px-5 py-2.5 rounded-lg hover:bg-charcoal-light transition-colors"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-light text-charcoal pr-8">
              Promuj „{productName}"
            </h2>
            <p className="text-[13px] text-warm-gray mt-2 mb-6 leading-relaxed">
              Zwiększ widoczność produktu w serwisie. Zostaw nam swoje preferencje, a my się odezwiemy.
            </p>

            <div className="mb-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-warm-gray mb-3">
                Budżet miesięczny
              </p>
              <div className="grid grid-cols-2 gap-2">
                {BUDGETS.map((b) => {
                  const selected = budget === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      aria-pressed={selected}
                      className={`text-[13px] px-3 py-2.5 rounded-lg border transition-colors ${
                        selected
                          ? "bg-charcoal text-white border-charcoal"
                          : "bg-white border-border text-charcoal hover:border-charcoal/40"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-warm-gray mb-3">
                Rodzaj widoczności
              </p>
              <div className="space-y-2">
                {VISIBILITY.map((v) => {
                  const selected = visibility.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() => toggleVisibility(v)}
                      className={`w-full flex items-center gap-3 text-left text-[13px] px-3 py-2.5 rounded-lg border transition-colors ${
                        selected
                          ? "bg-charcoal/5 border-charcoal text-charcoal"
                          : "bg-white border-border text-charcoal hover:border-charcoal/40"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selected ? "bg-charcoal border-charcoal" : "border-warm-gray/40"
                        }`}
                        aria-hidden="true"
                      >
                        {selected && (
                          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-charcoal text-white text-[12px] font-medium uppercase tracking-wide px-5 py-3 rounded-lg hover:bg-charcoal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Wyślij
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
