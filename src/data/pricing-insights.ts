// Demo data for the seller "Cennik" (Pricing) dashboard.
// All values are illustrative mock data — there is no real pipeline to the
// 2.4M-buyer database in v1. Prices are in PLN (zł).

export interface CategoryMedian {
  category: string;
  yourPrice: number;
  medianPrice: number;
  /** Percentage difference of yourPrice vs medianPrice, rounded. */
  delta: number;
}

export interface ConversionRow {
  category: string;
  /** Your conversion rate, in percent. */
  yourCR: number;
  /** Category average conversion rate, in percent. */
  categoryCR: number;
}

export interface TrendingProduct {
  name: string;
  category: string;
  /** Demand growth over the last 7 days, in percent. */
  demandGrowth: number;
  image: string;
  /** Daily demand index over the last 7 days (sparkline). */
  trend: number[];
}

export const categoryMedians: CategoryMedian[] = [
  { category: "Sneakersy", yourPrice: 349, medianPrice: 379, delta: -8 },
  { category: "Buty trekkingowe", yourPrice: 599, medianPrice: 529, delta: 13 },
  { category: "Buty miejskie", yourPrice: 419, medianPrice: 429, delta: -2 },
  { category: "Buty sportowe", yourPrice: 529, medianPrice: 489, delta: 8 },
];

export const conversionVsCategory: ConversionRow[] = [
  { category: "Sneakersy", yourCR: 3.6, categoryCR: 3.4 },
  { category: "Buty trekkingowe", yourCR: 2.1, categoryCR: 2.9 },
  { category: "Buty miejskie", yourCR: 2.8, categoryCR: 3.1 },
  { category: "Buty sportowe", yourCR: 4.2, categoryCR: 3.7 },
];

export const trendingNow: TrendingProduct[] = [
  { name: "Runner Lite", category: "Sneakersy", demandGrowth: 34, image: "/images/products/product-1.jpg", trend: [12, 14, 13, 18, 22, 27, 31] },
  { name: "CloudStep Pro", category: "Buty sportowe", demandGrowth: 28, image: "/images/products/product-3.jpg", trend: [20, 19, 22, 21, 25, 28, 30] },
  { name: "Soft Walk", category: "Buty miejskie", demandGrowth: 19, image: "/images/products/product-7.jpg", trend: [16, 15, 17, 16, 18, 20, 21] },
  { name: "Trail Boss", category: "Buty trekkingowe", demandGrowth: 12, image: "/images/products/product-9.jpg", trend: [9, 10, 9, 11, 10, 12, 13] },
];

/**
 * Locked Pro-tier chart series — illustrative, blurred behind the paywall.
 * Keyed by feature name shown in the dashboard.
 */
export const proPreviewSeries: Record<string, number[]> = {
  "Trendy 90 dni": [42, 48, 45, 52, 58, 55, 63, 71, 68, 79, 88, 95],
  "Pełna baza 2,4 mln kupujących": [120, 180, 150, 240, 210, 320, 360, 410],
  "Rekomendacje cen": [349, 369, 359, 379, 389, 399, 419],
  "Alerty cenowe": [60, 40, 55, 35, 70, 30, 65, 25],
};
