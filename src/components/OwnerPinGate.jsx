import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { btnPrimary, linkBtn, label, input } from "./styles.jsx";

export default function OwnerPinGate({ onUnlock, onBack }) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState(""); // "", "checking", "wrong", "locked"
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const submit = async () => {
    if (pin.length !== 6) return;
    setStatus("checking");
    const { data, error } = await supabase.rpc("verify_owner_pin", { input_pin: pin });
    if (error) {
      setStatus("wrong");
      return;
    }
    if (data === "ok") {
      localStorage.setItem("crisvin_owner_unlocked", "true");
      onUnlock();
    } else if (data === "locked") {
      setStatus("locked");
    } else if (data?.startsWith("wrong:")) {
      setAttemptsLeft(data.split(":")[1]);
      setStatus("wrong");
      setPin("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 300, margin: "0 auto", width: "100%", textAlign: "center" }}>
        <button onClick={onBack} style={{ ...linkBtn, alignSelf: "flex-start" }}>← Back</button>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, margin: "16px 0 4px", color: "#2F5233" }}>
          Owner access
        </h2>
        <p style={{ color: "#5B5346", fontSize: 14, marginBottom: 20 }}>Enter the 6-digit PIN.</p>

        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          type="password"
          inputMode="numeric"
          placeholder="••••••"
          autoFocus
          disabled={status === "locked"}
          style={{ ...input, textAlign: "center", fontSize: 24, letterSpacing: 8, fontFamily: "'JetBrains Mono', monospace" }}
        />

        {status === "wrong" && (
          <p style={{ color: "#C1440E", fontSize: 12.5, marginTop: 10 }}>
            Wrong PIN{attemptsLeft ? ` — ${attemptsLeft} attempt${attemptsLeft === "1" ? "" : "s"} left` : ""}.
          </p>
        )}
        {status === "locked" && (
          <p style={{ color: "#C1440E", fontSize: 12.5, marginTop: 10 }}>
            Too many wrong attempts. Locked for 15 minutes.
          </p>
        )}

        <button
          onClick={submit}
          disabled={pin.length !== 6 || status === "checking" || status === "locked"}
          style={{ ...btnPrimary, width: "100%", marginTop: 16, opacity: pin.length === 6 && status !== "locked" ? 1 : 0.4 }}
        >
          {status === "checking" ? "Checking…" : "Unlock"}
        </button>
      </div>
    </div>
  );
}
