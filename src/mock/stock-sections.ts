export interface StockSection {
  slug: string;
  name: string;
  desc: string;
  pending?: boolean;
}

export const STOCK_SECTIONS: StockSection[] = [
  { slug: "raw-materials", name: "Raw Materials", desc: "Units, conversions, rates and live stock on hand" },
  { slug: "suppliers", name: "Suppliers", desc: "Vendor master with GSTIN and outstanding balance" },
  { slug: "purchases", name: "Purchases", desc: "Purchase orders and goods receipt into stock" },
  { slug: "recipes", name: "Recipes", desc: "Per-dish material consumption for costing" },
  { slug: "semi-finished", name: "Semi Finished", desc: "Batch preparations that consume raw materials" },
  { slug: "wastage", name: "Wastage", desc: "Recorded spoilage and preparation loss" },
  { slug: "closing-stock", name: "Closing Stock", desc: "Valuation of stock on hand by category" },
  { slug: "low-stock", name: "Low Stock", desc: "Materials at or below their reorder level" },
  {
    slug: "stock-adjustment",
    name: "Stock Adjustment",
    desc: "Manual correction of stock on hand",
    pending: true,
  },
  {
    slug: "negative-stock-policy",
    name: "Negative Stock Policy",
    desc: "Behaviour when consumption exceeds stock",
    pending: true,
  },
  {
    slug: "stock-transfer",
    name: "Stock Transfer",
    desc: "Movement of stock between storage locations",
    pending: true,
  },
];
