// Utang Book interest math, kept isolated from UI so new interest types
// can be added here in one place (e.g. compounding, tiered rates) later.

const monthsBetween = (from, to) => {
  const ms = to - new Date(from);
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 30));
};

export function computeInterest(debt) {
  if (debt.interest_type === "none") return 0;
  if (debt.interest_type === "flat") return Number(debt.interest_value);
  if (debt.interest_type === "percent-once") return debt.principal * (debt.interest_value / 100);
  if (debt.interest_type === "percent-monthly") {
    const months = monthsBetween(debt.date_borrowed, new Date());
    return debt.principal * (debt.interest_value / 100) * months;
  }
  return 0;
}

export function debtBalance(debt, payments = []) {
  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const owed = Number(debt.principal) + computeInterest(debt);
  return Math.max(0, owed - paid);
}
