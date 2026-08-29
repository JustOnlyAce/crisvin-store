import React from "react";
import { STORE_CONFIG } from "../config/store";

const peso = (n) => `P${Number(n).toFixed(2)}`; // plain "P" — thermal printers often can't render ₱

// This renders off-screen at all times, and only becomes visible via the
// @media print rules in styles.jsx's <PrintStyles/> when window.print() is
// triggered. On the Android device, RawBT intercepts that print job and
// sends it to the GOOJPRT PT-210 over Bluetooth as a formatted receipt.
export default function Receipt({ order }) {
  if (!order) return null;

  return (
    <div id="receipt-print-area">
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>{STORE_CONFIG.name}</div>
        <div style={{ fontSize: 10 }}>{STORE_CONFIG.tagline}</div>
      </div>
      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
      <div>Order: {order.code}</div>
      <div>Date: {new Date(order.placed_at).toLocaleString("en-PH")}</div>
      <div>Customer: {order.customers?.name}</div>
      <div>Payment: {order.payment_method === "cash" ? "Cash" : "GCash/Bank"}</div>
      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
      {order.order_items.map((i) => (
        <div key={i.id} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{i.product_name} x{i.quantity}</span>
          <span>{peso(i.unit_price * i.quantity)}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>TOTAL</span>
        <span>{peso(order.total)}</span>
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 10 }}>Salamat po!</div>
    </div>
  );
}
