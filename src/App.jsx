import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./lib/supabaseClient";
import { computeInterest, debtBalance } from "./lib/interest";
import { STORE_CONFIG } from "./config/store";
import { RoleGate, CustomerLogin } from "./components/Onboarding";
import CustomerApp from "./components/CustomerApp";
import OwnerApp from "./components/OwnerApp";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
`;

const peso = (n) => `₱${Number(n).toFixed(2)}`;
const genCode = () => "CS-" + Math.floor(1000 + Math.random() * 9000);

export default function App() {
  const [mode, setMode] = useState(null); // 'customer' | 'owner'
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Load data + keep orders live-updating ----
  useEffect(() => {
    loadAll();

    // Realtime: whenever any order changes anywhere, refresh the orders list.
    // This is what lets your mother's dashboard update instantly when a
    // customer places an order, with no refresh needed.
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders(), loadDebts()]);
    setLoading(false);
  }

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").order("category");
    setProducts(data || []);
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*, customers(name, phone), order_items(*)")
      .order("placed_at", { ascending: false });
    setOrders(data || []);
  }

  async function loadDebts() {
    const { data } = await supabase
      .from("debts")
      .select("*, debt_payments(*)")
      .order("created_at", { ascending: false });
    setDebts(data || []);
  }

  // ---- Actions ----
  async function placeOrder({ name, phone, items, paymentMethod, total }) {
    // Find or create the customer record.
    let { data: existing } = await supabase.from("customers").select("*").eq("phone", phone).maybeSingle();
    let customerId = existing?.id;
    if (!customerId) {
      const { data: created } = await supabase.from("customers").insert({ name, phone }).select().single();
      customerId = created.id;
    }

    const { data: order } = await supabase
      .from("orders")
      .insert({ code: genCode(), customer_id: customerId, payment_method: paymentMethod, total, status: "Pending" })
      .select()
      .single();

    await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.qty,
      }))
    );

    // Decrement stock for each item ordered.
    for (const i of items) {
      const product = products.find((p) => p.id === i.id);
      if (product) {
        await supabase.from("products").update({ stock: Math.max(0, product.stock - i.qty) }).eq("id", i.id);
      }
    }

    await loadProducts();
    await loadOrders();
    return order;
  }

  async function advanceOrderStatus(orderId, currentStatus) {
    const next = currentStatus === "Pending" ? "Ready for Pickup" : "Completed";
    await supabase.from("orders").update({ status: next }).eq("id", orderId);
    await loadOrders();
  }

  async function updateStock(productId, delta) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newStock = Math.max(0, product.stock + delta);
    await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    await loadProducts();
  }

  async function addDebt(entry) {
    await supabase.from("debts").insert(entry);
    await loadDebts();
  }

  async function recordDebtPayment(debtId, amount) {
    await supabase.from("debt_payments").insert({ debt_id: debtId, amount });
    await loadDebts();
  }

  return (
    <div style={{ fontFamily: "'Public Sans', sans-serif", background: "#FAF7F0", color: "#2B2620", minHeight: "100vh" }}>
      <style>{FONT_IMPORT}</style>
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#8C6A4A" }}>Loading {STORE_CONFIG.name}…</div>
      ) : !mode ? (
        <RoleGate onPick={setMode} />
      ) : mode === "customer" && !customer ? (
        <CustomerLogin onLogin={setCustomer} onBack={() => setMode(null)} />
      ) : mode === "customer" ? (
        <CustomerApp
          customer={customer}
          products={products}
          orders={orders.filter((o) => o.customers?.phone === customer.phone)}
          onPlaceOrder={placeOrder}
          onSwitchRole={() => {
            setMode(null);
            setCustomer(null);
          }}
        />
      ) : (
        <OwnerApp
          products={products}
          orders={orders}
          debts={debts}
          onAdvanceOrder={advanceOrderStatus}
          onUpdateStock={updateStock}
          onAddDebt={addDebt}
          onRecordPayment={recordDebtPayment}
          onSwitchRole={() => setMode(null)}
        />
      )}
    </div>
  );
}


