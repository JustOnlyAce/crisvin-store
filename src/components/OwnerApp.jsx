import React, { useState, useMemo } from "react";
import { TopBar, EmptyState, StatusPill, StatCard, btnSmall, chip, qtyBtnLight, sectionTitle } from "./styles.jsx";
import UtangBook from "./UtangBook";

const peso = (n) => `₱${Number(n).toFixed(2)}`;

export default function OwnerApp({ products, orders, debts, onAdvanceOrder, onUpdateStock, onAddDebt, onRecordPayment, onSwitchRole }) {
  const [tab, setTab] = useState("orders");
  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.placed_at).toDateString() === today);
  const todaysTotal = todaysOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const bestSellers = useMemo(() => {
    const counts = {};
    orders.forEach((o) => o.order_items.forEach((i) => (counts[i.product_name] = (counts[i.product_name] || 0) + i.quantity)));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  return (
    <div style={{ paddingBottom: 84, minHeight: "100vh" }}>
      <TopBar title="Crisvin Store" subtitle="Owner dashboard" onSwitchRole={onSwitchRole} />

      <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" }}>
        {[
          { id: "orders", label: `Orders${pendingCount ? ` (${pendingCount})` : ""}` },
          { id: "products", label: "Products" },
          { id: "sales", label: "Sales" },
          { id: "utang", label: "Utang Book" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...chip, background: tab === t.id ? "#2F5233" : "#EFEAE0", color: tab === t.id ? "#FAF7F0" : "#5B5346", fontWeight: tab === t.id ? 600 : 500 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div style={{ padding: "4px 16px 16px" }}>
          {orders.length === 0 ? (
            <EmptyState text="No orders yet. When customers order, they'll appear here in real time." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((o) => (
                <div key={o.id} style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13 }}>{o.code}</span>
                    <StatusPill status={o.status} />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{o.customers?.name}</div>
                  <div style={{ fontSize: 12, color: "#8C6A4A", marginBottom: 8 }}>{o.customers?.phone} · {o.payment_method === "cash" ? "Cash on pickup" : "GCash/Bank"}</div>
                  <div style={{ borderTop: "1px dashed #E4DCC9", paddingTop: 8, marginBottom: 8 }}>
                    {o.order_items.map((i) => (
                      <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
                        <span>{i.product_name} ×{i.quantity}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{peso(i.unit_price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#2F5233" }}>{peso(o.total)}</span>
                    {o.status !== "Completed" && (
                      <button onClick={() => onAdvanceOrder(o.id, o.status)} style={btnSmall}>
                        {o.status === "Pending" ? "Mark Ready" : "Mark Completed"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "products" && (
        <div style={{ padding: "4px 16px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#8C6A4A" }}>{p.category} · {peso(p.price)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onUpdateStock(p.id, -1)} style={qtyBtnLight}>−</button>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, minWidth: 22, textAlign: "center", color: p.stock <= 5 ? "#C1440E" : "#2B2620" }}>{p.stock}</span>
                  <button onClick={() => onUpdateStock(p.id, 1)} style={qtyBtnLight}>+</button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#8C6A4A", marginTop: 14, lineHeight: 1.5 }}>
            Scan a barcode into a "new product" form (coming next) to add items straight from the scanner gun.
          </p>
        </div>
      )}

      {tab === "sales" && (
        <div style={{ padding: "4px 16px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <StatCard label="Today's orders" value={todaysOrders.length} />
            <StatCard label="Today's income" value={peso(todaysTotal)} />
          </div>
          <h3 style={sectionTitle}>Best sellers</h3>
          {bestSellers.length === 0 ? (
            <EmptyState text="Sales data will show up here once orders start coming in." />
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: 6 }}>
              {bestSellers.map(([name, qty], idx) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: idx < bestSellers.length - 1 ? "1px solid #F1EBDD" : "none" }}>
                  <span style={{ fontSize: 13 }}>{name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12.5, color: "#2F5233" }}>{qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "utang" && <UtangBook debts={debts} onAddDebt={onAddDebt} onRecordPayment={onRecordPayment} />}
    </div>
  );
}
