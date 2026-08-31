import React, { useState } from "react";
import { btnPrimary, btnGhost, linkBtn, label, input } from "./styles.jsx";
import { STORE_CONFIG } from "../config/store";

export function RoleGate({ onPick }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <img src="/logo.png" alt={STORE_CONFIG.name} style={{ width: 200, height: 200, objectFit: "contain", marginBottom: 8 }} />
      <p style={{ maxWidth: 320, color: "#5B5346", marginBottom: 36, fontSize: 15, lineHeight: 1.5 }}>
        Order ahead, skip the line. Pick how you're using the app today.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
        <button onClick={() => onPick("customer")} style={btnPrimary}>I'm here to shop</button>
        <button onClick={() => onPick("owner")} style={btnGhost}>Store owner dashboard</button>
      </div>
    </div>
  );
}

// Accepts 09XXXXXXXXX (11 digits) or +639XXXXXXXXX, ignoring spaces/dashes —
// the two common ways people write a PH mobile number.
function isValidPhone(raw) {
  const cleaned = raw.replace(/[\s-]/g, "");
  return /^(09\d{9}|\+639\d{9})$/.test(cleaned);
}

export function CustomerLogin({ onLogin, onBack }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const phoneValid = isValidPhone(phone);
  const canSubmit = name.trim().length > 1 && phoneValid;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 340, margin: "0 auto", width: "100%" }}>
        <button onClick={onBack} style={linkBtn}>← Back</button>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, margin: "16px 0 4px", color: "#2F5233" }}>Quick sign-in</h2>
        <p style={{ color: "#5B5346", fontSize: 14, marginBottom: 24 }}>Just your name and mobile number — no password needed.</p>
        <label style={label}>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria Santos" style={input} />
        <label style={label}>Mobile number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="09XX XXX XXXX"
          style={input}
        />
        {touched && phone.trim() && !phoneValid && (
          <p style={{ fontSize: 12, color: "#C1440E", marginTop: 6 }}>
            Enter a valid PH mobile number, e.g. 09171234567.
          </p>
        )}
        <button
          disabled={!canSubmit}
          onClick={() => onLogin({ name: name.trim(), phone: phone.trim() })}
          style={{ ...btnPrimary, marginTop: 20, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed" }}
        >
          Continue to shop
        </button>
      </div>
    </div>
  );
}
