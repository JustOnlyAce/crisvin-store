import React, { useState, useMemo } from "react";
import { STORE_CONFIG } from "../config/store";
import { TopBar, EmptyState, StatusPill, btnPrimary, btnSmall, label, input, chip, productCard, qtyBtn, sectionTitle, payToggle, payToggleActive } from "./styles.jsx";

const peso = (n) => `₱${Number(n).toFixed(2)}`;

export default function CustomerApp({ customer, products, orders, onPlaceOrder, onSwitchRole }) {
  const [tab, setTab] = useState("shop");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState({});
  const [payment, setPayment] = useState("cash");
  const [placing, setPlacing] = useState(false);
  const [justPlaced, setJustPlaced] = useState(null);

  const filtered = useMemo(() => products.filter((p) => category === "All" || p.category === category), [products, category]);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty }));
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const [maxReachedId, setMaxReachedId] = useState(null);

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const changeQty = (id, delta, stock) => {
    setCart((c) => {
      const current = c[id] || 0;
      const next = current + delta;
      if (delta > 0 && next > stock) {
        setMaxReachedId(id);
        setTimeout(() => setMaxReachedId((cur) => (cur === id ? null : cur)), 1800);
        return c; // ignore the tap, stay at current qty
      }
      return { ...c, [id]: Math.max(0, next) };
    });
  };

  const placeOrder = async () => {
    setPlacing(true);
    const order = await onPlaceOrder({ name: customer.name, phone: customer.phone, items: cartItems, paymentMethod: payment, total });
    setCart({});
    setPlacing(false);
    setJustPlaced(order);
    setTab("orders");
  };

  return (
    <div style={{ paddingBottom: 84, minHeight: "100vh" }}>
      <TopBar title={STORE_CONFIG.name} subtitle={`Hi, ${customer.name.split(" ")[0]}`} onSwitchRole={onSwitchRole} />

      {tab === "shop" && (
        <div style={{ padding: "4px 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0 16px" }}>
            {STORE_CONFIG.categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} style={{ ...chip, background: category === c ? "#2F5233" : "#EFEAE0", color: category === c ? "#FAF7F0" : "#5B5346", fontWeight: category === c ? 600 : 500 }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((p) => {
              const qty = cart[p.id] || 0;
              const outOfStock = p.stock === 0;
              return (
                <div key={p.id} style={productCard}>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                  ) : (
                    <div style={{ width: "100%", height: 80, borderRadius: 8, background: "#EFEAE0", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📦</div>
                  )}
                  <span style={{ fontSize: 11, color: outOfStock || p.stock <= STORE_CONFIG.lowStockThreshold ? "#C1440E" : "#2F5233", fontWeight: 600 }}>
                    {outOfStock ? "OUT OF STOCK" : p.stock <= STORE_CONFIG.lowStockThreshold ? `Only ${p.stock} left` : "IN STOCK"}
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, margin: "8px 0 6px", minHeight: 36 }}>{p.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 16, color: "#2F5233", marginBottom: 10 }}>{peso(p.price)}</div>
                  {qty === 0 ? (
                    <button disabled={outOfStock} onClick={() => addToCart(p.id)} style={{ ...btnSmall, opacity: outOfStock ? 0.35 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}>Add</button>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#2F5233", borderRadius: 8, padding: "6px 10px" }}>
                        <button onClick={() => changeQty(p.id, -1, p.stock)} style={qtyBtn}>−</button>
                        <span style={{ color: "#FAF7F0", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{qty}</span>
                        <button onClick={() => changeQty(p.id, 1, p.stock)} style={{ ...qtyBtn, opacity: qty >= p.stock ? 0.5 : 1 }}>+</button>
                      </div>
                      {maxReachedId === p.id && (
                        <p style={{ fontSize: 10.5, color: "#C1440E", textAlign: "center", marginTop: 4 }}>That's all we have in stock!</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "cart" && (
        <div style={{ padding: 16 }}>
          <h2 style={sectionTitle}>Your order</h2>
          {cartItems.length === 0 ? (
            <EmptyState text="Your basket is empty. Add items from the shop to get started." />
          ) : (
            <>
              <div style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 12, color: "#2F5233" }}>Order summary</div>
                {cartItems.map((i) => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "6px 0", borderBottom: "1px dashed #E4DCC9" }}>
                    <span>{i.name} <span style={{ color: "#8C6A4A" }}>×{i.qty}</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{peso(i.price * i.qty)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2F5233" }}>{peso(total)}</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={label}>How will you pay?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {STORE_CONFIG.paymentMethods.map((m) => (
                    <button key={m.id} onClick={() => setPayment(m.id)} style={{ ...payToggle, ...(payment === m.id ? payToggleActive : {}) }}>{m.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={placeOrder} disabled={placing} style={{ ...btnPrimary, marginTop: 22, width: "100%" }}>
                {placing ? "Placing order…" : `Place order — ${peso(total)}`}
              </button>
            </>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div style={{ padding: 16 }}>
          <h2 style={sectionTitle}>Your orders</h2>
          {justPlaced && (
            <div style={{ background: "#E7EEE3", border: "1px solid #2F5233", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13.5, color: "#2F5233" }}>
              Order <strong>{justPlaced.code}</strong> placed! We'll get it ready for pickup.
            </div>
          )}
          {orders.length === 0 ? (
            <EmptyState text="No orders yet. Once you place one, it'll show up here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((o) => (
                <div key={o.id} style={productCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13 }}>{o.code}</span>
                    <StatusPill status={o.status} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "#5B5346" }}>{o.order_items.length} item(s) · {o.payment_method === "cash" ? "Cash" : "GCash/Bank"}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#2F5233" }}>{peso(o.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E4DCC9", display: "flex", padding: "10px 8px", maxWidth: 480, margin: "0 auto" }}>
        {[{ id: "shop", label: "Shop" }, { id: "cart", label: "Cart", badge: cartCount }, { id: "orders", label: "Orders" }].map((it) => (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ flex: 1, background: "none", border: "none", padding: "6px 4px", fontSize: 12.5, fontWeight: tab === it.id ? 700 : 500, color: tab === it.id ? "#2F5233" : "#8C6A4A", position: "relative", cursor: "pointer" }}>
            {it.label}
            {!!it.badge && <span style={{ position: "absolute", top: -2, right: "28%", background: "#C1440E", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 5px" }}>{it.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
