// Store-wide settings. Edit this file to rebrand or reconfigure without
// touching component code. Add new settings here as the store grows
// (e.g. delivery radius, opening hours, multiple branches).

export const STORE_CONFIG = {
  name: "Crisvin Store",
  tagline: "Sari-sari, simplified",
  categories: ["All", "Canned Goods", "Rice & Grains", "Beverages", "Snacks", "Household"],
  paymentMethods: [
    { id: "cash", label: "Cash on pickup" },
    { id: "gcash", label: "GCash / Bank" },
  ],
  lowStockThreshold: 5,
};
