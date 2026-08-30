import React, { useState, useMemo } from "react";
import { TopBar, EmptyState, StatusPill, StatCard, btnPrimary, btnSmall, label, input, chip, qtyBtnLight, sectionTitle, linkBtn, PrintStyles } from "./styles.jsx";
import UtangBook from "./UtangBook";
import { STORE_CONFIG } from "../config/store";
import { lookupBarcode } from "../lib/productLookup";
import Receipt from "./Receipt";
import QuickSale from "./QuickSale";

const peso = (n) => `₱${Number(n).toFixed(2)}`;

export default function OwnerApp({ products, orders, debts, onAdvanceOrder, onUpdateStock, onAddProduct, onUpdatePrice, onUpdateProduct, onDeleteProduct, onFinishSale, onAddDebt, onRecordPayment, onSwitchRole }) {
  const [tab, setTab] = useState("orders");
  const [printingOrder, setPrintingOrder] = useState(null);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const handlePrint = (order) => {
    setPrintingOrder(order);
    // give React a moment to render the receipt content before the print dialog opens
    setTimeout(() => window.print(), 100);
  };

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
      <PrintStyles />
      <Receipt order={printingOrder} />
      <TopBar title="Crisvin Store" subtitle="Owner dashboard" onSwitchRole={onSwitchRole} />

      <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" }}>
        {[
          { id: "orders", label: `Orders${pendingCount ? ` (${pendingCount})` : ""}` },
          { id: "quicksale", label: "Quick Sale" },
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
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{o.customers?.name || "Walk-in customer"}</div>
                  <div style={{ fontSize: 12, color: "#8C6A4A", marginBottom: 8 }}>{o.customers?.phone ? `${o.customers.phone} · ` : ""}{o.payment_method === "cash" ? "Cash" : "GCash/Bank"}</div>
                  <div style={{ borderTop: "1px dashed #E4DCC9", paddingTop: 8, marginBottom: 8 }}>
                    {o.order_items.map((i) => (
                      <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
                        <span>{i.product_name} ×{i.quantity}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{peso(i.unit_price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#2F5233" }}>{peso(o.total)}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handlePrint(o)} style={{ ...btnSmall, background: "#8C6A4A", width: "auto", padding: "8px 12px" }}>
                        🖨 Print
                      </button>
                      {o.status !== "Completed" && (
                        <button onClick={() => onAdvanceOrder(o.id, o.status)} style={{ ...btnSmall, width: "auto", padding: "8px 12px" }}>
                          {o.status === "Pending" ? "Mark Ready" : "Mark Completed"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "quicksale" && <QuickSale products={products} onUpdateStock={onUpdateStock} onFinishSale={onFinishSale} onPrint={handlePrint} />}

      {tab === "products" && <ProductsTab products={products} onUpdateStock={onUpdateStock} onAddProduct={onAddProduct} onUpdatePrice={onUpdatePrice} onUpdateProduct={onUpdateProduct} onDeleteProduct={onDeleteProduct} />}

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

function ProductsTab({ products, onUpdateStock, onAddProduct, onUpdatePrice, onUpdateProduct, onDeleteProduct }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <button onClick={() => setShowForm((s) => !s)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>
        {showForm ? "Cancel" : "+ Add new product"}
      </button>

      {showForm && (
        <AddProductForm
          onAdd={async (product) => {
            const error = await onAddProduct(product);
            if (!error) setShowForm(false);
            return error;
          }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#EFEAE0", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.image_url ? (
                  <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 16 }}>📦</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#8C6A4A", display: "flex", alignItems: "center", gap: 4 }}>
                  {p.category} · <EditablePrice value={p.price} onSave={(newPrice) => onUpdatePrice(p.id, newPrice)} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => onUpdateStock(p.id, -1)} style={qtyBtnLight}>−</button>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, minWidth: 22, textAlign: "center", color: p.stock <= STORE_CONFIG.lowStockThreshold ? "#C1440E" : "#2B2620" }}>{p.stock}</span>
                <button onClick={() => onUpdateStock(p.id, 1)} style={qtyBtnLight}>+</button>
              </div>
              <button
                onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4, color: "#8C6A4A" }}
                aria-label="Product settings"
              >
                ⚙️
              </button>
            </div>

            {editingId === p.id && (
              <ProductSettingsPanel
                product={p}
                onSave={async (fields) => {
                  await onUpdateProduct(p.id, fields);
                  setEditingId(null);
                }}
                onDelete={async () => {
                  await onDeleteProduct(p.id);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSettingsPanel({ product, onSave, onDelete, onCancel }) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(product.price);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canSave = name.trim() && Number(price) > 0;

  return (
    <div style={{ borderTop: "1px solid #E4DCC9", marginTop: 12, paddingTop: 12 }}>
      <label style={{ ...label, marginTop: 0 }}>Product name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={input} />

      <label style={label}>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...input, appearance: "auto" }}>
        {STORE_CONFIG.categories.filter((c) => c !== "All").map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label style={label}>Price (₱)</label>
      <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" style={input} />

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={onCancel} style={{ ...linkBtn, flex: 1, textAlign: "center", padding: "10px" }}>Cancel</button>
        <button
          disabled={!canSave || saving}
          onClick={async () => {
            setSaving(true);
            await onSave({ name: name.trim(), category, price: Number(price) });
            setSaving(false);
          }}
          style={{ ...btnPrimary, flex: 2, opacity: canSave ? 1 : 0.4 }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #E4DCC9" }}>
        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} style={{ ...linkBtn, color: "#C1440E", width: "100%", textAlign: "center" }}>
            Delete this product
          </button>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 12.5, color: "#C1440E", marginBottom: 10 }}>
              Delete "{product.name}"? It'll disappear from the shop and your product list. Past orders that included it are unaffected.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmingDelete(false)} style={{ ...linkBtn, flex: 1, textAlign: "center", padding: "10px" }}>Keep it</button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await onDelete();
                }}
                style={{ ...btnPrimary, flex: 1, background: "#C1440E" }}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddProductForm({ onAdd }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(STORE_CONFIG.categories[1] || "");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [lookupStatus, setLookupStatus] = useState(""); // "", "looking", "found", "not-found"
  const barcodeRef = React.useRef(null);

  // Auto-focus the barcode field so a scanner gun can fill it in immediately
  // the moment this form opens, without the owner needing to tap first.
  React.useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const canSubmit = name.trim() && Number(price) > 0 && Number(stock) >= 0;

  // Scanner guns send the barcode digits then an Enter keypress automatically —
  // use that Enter as the signal to look up the product, same as if the owner
  // finished typing it by hand and pressed Enter to confirm.
  const handleBarcodeKeyDown = async (e) => {
    if (e.key !== "Enter" || !barcode.trim()) return;
    e.preventDefault();
    setLookupStatus("looking");
    const result = await lookupBarcode(barcode.trim());
    if (result) {
      setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.imageUrl) setImageUrl(result.imageUrl);
      setLookupStatus("found");
    } else {
      setLookupStatus("not-found");
    }
  };

  const handleSubmit = async () => {
    setError("");
    const err = await onAdd({
      name: name.trim(),
      category,
      price: Number(price),
      stock: Number(stock),
      barcode: barcode.trim() || null,
      image_url: imageUrl.trim() || null,
    });
    if (err) {
      setError(err.code === "23505" ? "That barcode is already used by another product." : "Something went wrong — try again.");
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: 14, marginBottom: 16 }}>
      <label style={{ ...label, marginTop: 0 }}>Barcode (scan here, or leave blank)</label>
      <input
        ref={barcodeRef}
        value={barcode}
        onChange={(e) => { setBarcode(e.target.value); setLookupStatus(""); }}
        onKeyDown={handleBarcodeKeyDown}
        placeholder="Scan or type barcode, then press Enter"
        style={input}
      />
      {lookupStatus === "looking" && <p style={{ fontSize: 12, color: "#8C6A4A", marginTop: 6 }}>Looking up product…</p>}
      {lookupStatus === "found" && <p style={{ fontSize: 12, color: "#2F5233", marginTop: 6 }}>✓ Found it — double-check the details below.</p>}
      {lookupStatus === "not-found" && <p style={{ fontSize: 12, color: "#8C6A4A", marginTop: 6 }}>Not found in the product database — please fill in the details below manually. (It'll be remembered for every scan after this one.)</p>}

      <label style={label}>Product name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lucky Me Pancit Canton" style={input} />

      <label style={label}>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...input, appearance: "auto" }}>
        {STORE_CONFIG.categories.filter((c) => c !== "All").map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Price (₱)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="0.00" style={input} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Starting stock</label>
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="0" style={input} />
        </div>
      </div>

      <label style={label}>Product photo</label>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 56, height: 56, borderRadius: 8, background: "#EFEAE0", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {imageUrl ? (
            <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImageUrl("")} />
          ) : (
            <span style={{ fontSize: 20 }}>📦</span>
          )}
        </div>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Auto-filled from scan, or paste an image link"
          style={{ ...input, flex: 1 }}
        />
      </div>

      {error && <p style={{ color: "#C1440E", fontSize: 12.5, marginTop: 10 }}>{error}</p>}

      <button
        disabled={!canSubmit}
        onClick={handleSubmit}
        style={{ ...btnPrimary, width: "100%", marginTop: 16, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed" }}
      >
        Save product
      </button>
    </div>
  );
}

function EditablePrice({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button onClick={() => { setDraft(value); setEditing(true); }} style={{ ...linkBtn, color: "#2F5233", fontWeight: 700 }}>
        {peso(value)} ✎
      </button>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        type="number"
        style={{ width: 70, padding: "2px 6px", fontSize: 12, border: "1px solid #E4DCC9", borderRadius: 6 }}
      />
      <button
        onClick={() => { onSave(Number(draft)); setEditing(false); }}
        style={{ ...linkBtn, color: "#2F5233", fontWeight: 700 }}
      >
        Save
      </button>
    </span>
  );
}
