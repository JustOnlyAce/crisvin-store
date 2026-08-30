// Store-wide settings. Edit this file to rebrand or reconfigure without
// touching component code. Add new settings here as the store grows
// (e.g. delivery radius, opening hours, multiple branches).

export const STORE_CONFIG = {
  name: "Crisvin Store",
  tagline: "Sari-sari, simplified",
  categories: [
    "All",
    "Canned Goods",
    "Rice & Grains",
    "Beverages",
    "Snacks",
    "Biscuits",
    "Dairy & Chilled Products",
    "Egg",
    "Household",
    "Detergent",
    "Dishwashing Liquid",
    "Bleach",
    "Sponges",
    "Disposables",
    "Plastic Bags",
    "Shampoo",
    "Soap",
    "Toothpaste",
    "Deodorant",
    "Diapers",
    "Baby Wipes",
    "Batteries",
    "Cigarette",
    "Dog Food",
  ],
  paymentMethods: [
    { id: "cash", label: "Cash on pickup" },
    { id: "gcash", label: "GCash / Bank" },
  ],
  lowStockThreshold: 5,
};
