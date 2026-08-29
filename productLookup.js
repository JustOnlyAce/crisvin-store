// Looks up a scanned barcode against Open Food Facts, a free, public,
// crowd-sourced product database (no API key needed). Best coverage is for
// globally distributed packaged food/drinks; local-only Filipino products
// and non-food items (soap, detergent, etc.) often won't be found — that's
// expected, the owner can still fill those in by hand.

const CATEGORY_KEYWORDS = {
  "Beverages": ["beverage", "drink", "juice", "soda", "water", "coffee", "tea", "milk"],
  "Snacks": ["snack", "chip", "cracker", "candy", "chocolate", "cookie", "biscuit"],
  "Canned Goods": ["canned", "can-food", "tinned", "preserved"],
  "Rice & Grains": ["rice", "grain", "cereal", "pasta", "noodle"],
  "Household": ["detergent", "cleaning", "soap", "household"],
};

function guessCategory(offCategories = []) {
  const text = offCategories.join(" ").toLowerCase();
  for (const [ourCategory, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return ourCategory;
  }
  return null;
}

export async function lookupBarcode(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const name = data.product.product_name || data.product.product_name_en || null;
    const category = guessCategory(data.product.categories_tags || []);
    if (!name) return null;

    return { name, category };
  } catch {
    return null; // network hiccup or unrecognized barcode — fail quietly, owner fills in manually
  }
}
