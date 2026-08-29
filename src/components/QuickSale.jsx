import React, { useState, useRef, useEffect } from "react";
import { EmptyState, btnPrimary, btnSmall, btnGhost, chip, input } from "./styles.jsx";

const peso = (n) => `₱${Number(n).toFixed(2)}`;

export default function QuickSale({ products, onUpdateStock, onFinishSale }) {
  const [mode, setMode] = useState("sell"); // "sell" | "check"
  const [barcode, setBarcode] = useState("");
  const [sessionItems, setSessionItems] = useState([]); // [{id, name, price, qty}]
  const [feedback, setFeedback] = useState(null); // {type: "sold"|"checked"|"error", text}
  const [finishing, setFinishing] = useState(false);
  const barcodeRef = useRef(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, [mode]);

  const total = sessionItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleScan = (e) => {
    if (e.key !== "Enter" || !barcode.trim()) return;
    e.preventDefault();
    const code = barcode.trim();
    setBarcode("");

    const product = products.find((p) => p.barcode === code);
    if (!product) {
      setFeedback({ type: "error", text: `Not found in inventory: ${code}` });
      barcodeRef.current?.focus();
      return;
    }

    if (mode === "check") {
      setFeedback({ type: "checked", text: `${product.name} — ${peso(product.price)} (${product.stock} in stock)` });
      barcodeRef.current?.focus();
      return;
    }

    // Sell mode
    if (product.stock <= 0) {
      setFeedback({ type: "error", text: `${product.name} is out of stock!` });
      barcodeRef.current?.focus();
      return;
    }

    onUpdateStock(product.id, -1);
    setSessionItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    setFeedback({ type: "sold", text: `Added: ${product.name} — ${peso(product.price)}` });
    barcodeRef.current?.focus();
  };

  const undoLast = () => {
    if (sessionItems.length === 0) return;
    const last = sessionItems[sessionItems.length - 1];
    onUpdateStock(last.id, 1);
    setSessionItems((prev) => {
      const idx = prev.findIndex((i) => i.id === last.id);
      const item = prev[idx];
      if (item.qty > 1) {
        return prev.map((i, n) => (n === idx ? { ...i, qty: i.qty - 1 } : i));
      }
      return prev.filter((_, n) => n !== idx);
    });
    setFeedback(null);
  };

  const cancelSale = () => {
    sessionItems.forEach((i) => onUpdateStock(i.id, i.qty)); // restore all stock
    setSessionItems([]);
    setFeedback(null);
  };

  const finishSale = async () => {
    setFinishing(true);
    await onFinishSale(sessionItems, total);
    setSessionItems([]);
    setFeedback({ type: "sold", text: "Sale recorded ✓" });
    setFinishing(false);
  };

  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => { setMode("sell"); setFeedback(null); }} style={{ ...chip, background: mode === "sell" ? "#2F5233" : "#EFEAE0", color: mode === "sell" ? "#FAF7F0" : "#5B5346", fontWeight: mode === "sell" ? 600 : 500 }}>
          Sell
        </button>
        <button onClick={() => { setMode("check"); setFeedback(null); }} style={{ ...chip, background: mode === "check" ? "#2F5233" : "#EFEAE0", color: mode === "check" ? "#FAF7F0" : "#5B5346", fontWeight: mode === "check" ? 600 : 500 }}>
          Check price only
        </button>
      </div>

      <input
        ref={barcodeRef}
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleScan}
        placeholder={mode === "sell" ? "Scan item to sell" : "Scan item to check price"}
        style={{ ...input, fontSize: 16, textAlign: "center", marginBottom: 10 }}
      />

      {feedback && (
        <p style={{
          fontSize: 13, textAlign: "center", padding: "8px 10px", borderRadius: 8, marginBottom: 14,
          background: feedback.type === "error" ? "#FBEFD9" : "#E7EEE3",
          color: feedback.type === "error" ? "#C1440E" : "#2F5233",
        }}>
          {feedback.text}
        </p>
      )}

      {mode === "sell" && (
        <>
          {sessionItems.length === 0 ? (
            <EmptyState text="Scan an item to start this sale. Each scan sells one unit and lowers stock right away." />
          ) : (
            <>
              <div style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: "6px 14px", marginBottom: 12 }}>
                {sessionItems.map((i) => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #E4DCC9" }}>
                    <span style={{ fontSize: 13.5 }}>{i.name} <span style={{ color: "#8C6A4A" }}>×{i.qty}</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{peso(i.price * i.qty)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2F5233" }}>{peso(total)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={undoLast} style={{ ...btnGhost, flex: 1, padding: "10px" }}>Undo last</button>
                <button onClick={cancelSale} style={{ ...btnGhost, flex: 1, padding: "10px", color: "#C1440E", borderColor: "#C1440E" }}>Cancel sale</button>
              </div>
              <button onClick={finishSale} disabled={finishing} style={{ ...btnPrimary, width: "100%", marginTop: 8 }}>
                {finishing ? "Saving…" : `Finish sale — ${peso(total)}`}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
