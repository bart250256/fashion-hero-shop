// Pro commitment logging for the seller "Cennik" pre-sell experiment.
//
// This is a fake-door / pre-sell validation: when a seller saves a card to
// "activate" Pro, NO charge is made. The card is treated as saved in setup
// mode and we log the commitment event (who + when + which feature) so we can
// measure real demand. Persisted to localStorage — there is no backend in v1.

const STORAGE_KEY = "fashionhero_pro_commitments";

export interface SellerIdentity {
  name: string;
  email: string;
  store: string;
}

export interface ProCommitment {
  sellerEmail: string;
  sellerName: string;
  store: string;
  feature: string;
  plan: "pro";
  priceMonthly: number;
  cardLast4: string;
  mode: "setup";
  charged: false;
  timestamp: string;
}

export function getProCommitments(): ProCommitment[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ProCommitment[]) : [];
  } catch {
    return [];
  }
}

export function logProCommitment(
  seller: SellerIdentity,
  feature: string,
  cardLast4: string,
): ProCommitment {
  const commitment: ProCommitment = {
    sellerEmail: seller.email,
    sellerName: seller.name,
    store: seller.store,
    feature,
    plan: "pro",
    priceMonthly: 199,
    cardLast4,
    mode: "setup",
    charged: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getProCommitments();
    existing.push(commitment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // ignore write failures (e.g. storage disabled)
  }

  return commitment;
}
