// Looks up a scanned barcode against two free, public product databases
// (no API key needed for either). Coverage is best for globally distributed
// packaged food/drinks; small local-only Filipino products and non-food
// items often won't be found in either — that's expected. Once a product
// is added once, it lives in Crisvin Store's own database from then on, so
// this lookup only matters the very first time a given item is scanned.

const CATEGORY_KEYWORDS = {
  "Beverages": ["beverage", "drink", "juice", "soda", "water", "coffee", "tea"],
  "Dairy & Chilled Products": ["dairy", "milk", "cheese", "yogurt", "yoghurt", "butter", "chilled"],
  "Snacks": ["snack", "chip", "candy", "chocolate"],
  "Biscuits": ["biscuit", "cracker", "cookie"],
  "Canned Goods": ["canned", "can-food", "tinned", "preserved"],
  "Rice & Grains": ["rice", "grain", "cereal", "pasta", "noodle"],
  "Egg": ["egg"],
  "Detergent": ["detergent", "laundry"],
  "Dishwashing Liquid": ["dishwashing", "dish soap", "dish-soap"],
  "Bleach": ["bleach", "whitening-agent"],
  "Sponges": ["sponge", "scrub"],
  "Disposables": ["disposable", "paper-plate", "paper-cup", "tissue", "napkin"],
  "Plastic Bags": ["plastic-bag", "garbage-bag", "trash-bag"],
  "Shampoo": ["shampoo", "hair-care"],
  "Soap": ["soap", "body-wash"],
  "Toothpaste": ["toothpaste", "oral-care", "dental-care"],
  "Deodorant": ["deodorant", "antiperspirant"],
  "Diapers": ["diaper", "nappy"],
  "Baby Wipes": ["baby-wipe", "wet-wipe"],
  "Batteries": ["battery", "batteries"],
  "Cigarette": ["cigarette", "tobacco"],
  "Dog Food": ["dog-food", "pet-food"],
  "Household": ["household", "cleaning"],
};

function guessCategory(text = "") {
  const lower = text.toLowerCase();
  for (const [ourCategory, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return ourCategory;
  }
  return null;
}

async function lookupOpenFoodFacts(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const name = data.product.product_name || data.product.product_name_en || null;
    if (!name) return null;
    return {
      name,
      category: guessCategory((data.product.categories_tags || []).join(" ")),
      imageUrl: data.product.image_front_url || data.product.image_url || null,
    };
  } catch {
    return null;
  }
}

async function lookupUpcItemDb(barcode) {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`);
    const data = await res.json();
    const item = data.items?.[0];
    if (!item || !item.title) return null;
    return {
      name: item.title,
      category: guessCategory(item.category || ""),
      imageUrl: item.images?.[0] || null,
    };
  } catch {
    return null;
  }
}

export async function lookupBarcode(barcode) {
  // Try Open Food Facts first (best for food/drink), then fall back to
  // UPCitemdb (broader general-merchandise coverage) if nothing found.
  const fromOpenFoodFacts = await lookupOpenFoodFacts(barcode);
  if (fromOpenFoodFacts) return fromOpenFoodFacts;
  return await lookupUpcItemDb(barcode);
}

