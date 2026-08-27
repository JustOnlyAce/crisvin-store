import React, { useState } from "react";
import { computeInterest, debtBalance } from "../lib/interest";
import { EmptyState, StatCard, btnPrimary, btnSmall, linkBtn, label, input, chip, payToggle, payToggleActive } from "./styles.jsx";

const peso = (n) => `₱${Number(n).toFixed(2)}`;

export default function UtangBook({ debts, onAddDebt, onRecordPayment }) {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const visible = debts.filter((d) => filter === "all" || d.kind === filter);
  const totalOwedToStore = debts.filter((d) => d.kind === "customer").reduce((s, d) => s + debtBalance(d, d.debt_payments), 0);
  const totalStoreOwes = debts.filter((d) => d.kind === "loan").reduce((s, d) => s + debtBalance(d, d.debt_payments), 0);

  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard label="Customers owe the store" value={peso(totalOwedToStore)} />
        <StatCard label="Store owes lenders" value={peso(totalStoreOwes)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ id: "all", label: "All" }, { id: "customer", label: "Customer credit" }, { id: "loan", label: "Store loans" }].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ ...chip, background: filter === f.id ? "#2F5233" : "#EFEAE0", color: filter === f.id ? "#FAF7F0" : "#5B5346", fontWeight: filter === f.id ? 600 : 500 }}>
            {f.label}
          </button>
        ))}
      </div>

      <button onClick={() => setShowForm((s) => !s)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>
        {showForm ? "Cancel" : "+ Add entry"}
      </button>

      {showForm && <DebtForm onAdd={(entry) => { onAddDebt(entry); setShowForm(false); }} />}

      {visible.length === 0 ? (
        <EmptyState text="No entries here yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map((d) => {
            const balance = debtBalance(d, d.debt_payments);
            const interest = computeInterest(d);
            const settled = balance <= 0;
            return (
              <div key={d.id} style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: "#8C6A4A", fontWeight: 600, marginTop: 2 }}>
                      {d.kind === "customer" ? "OWES THE STORE" : "STORE OWES THEM"} · borrowed {peso(d.principal)} on {d.date_borrowed}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20, background: settled ? "#E7EEE3" : "#FBEFD9", color: settled ? "#2F5233" : "#8C6A4A" }}>
                    {settled ? "Settled" : "Outstanding"}
                  </span>
                </div>

                {d.notes && <div style={{ fontSize: 12.5, color: "#5B5346", margin: "8px 0", lineHeight: 1.5 }}>{d.notes}</div>}

                <div style={{ borderTop: "1px dashed #E4DCC9", marginTop: 8, paddingTop: 8, fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span style={{ color: "#5B5346" }}>Principal</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{peso(d.principal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span style={{ color: "#5B5346" }}>
                      Interest {d.interest_type === "none" ? "" : d.interest_type === "flat" ? "(flat)" : d.interest_type === "percent-once" ? `(${d.interest_value}% one-time)` : `(${d.interest_value}%/month)`}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{peso(interest)}</span>
                  </div>
                  {d.debt_payments.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                      <span style={{ color: "#5B5346" }}>Paid so far</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{peso(d.debt_payments.reduce((s, p) => s + Number(p.amount), 0))}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", fontWeight: 700 }}>
                    <span>Balance</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: settled ? "#2F5233" : "#C1440E" }}>{peso(balance)}</span>
                  </div>
                </div>

                {!settled && (
                  <div style={{ marginTop: 10 }}>
                    {payingId === d.id ? (
                      <PaymentInput max={balance} onCancel={() => setPayingId(null)} onConfirm={(amt) => { onRecordPayment(d.id, amt); setPayingId(null); }} />
                    ) : (
                      <button onClick={() => setPayingId(d.id)} style={btnSmall}>Record payment</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DebtForm({ onAdd }) {
  const [kind, setKind] = useState("customer");
  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestType, setInterestType] = useState("none");
  const [interestValue, setInterestValue] = useState("");
  const [notes, setNotes] = useState("");
  const canSubmit = name.trim() && Number(principal) > 0;

  return (
    <div style={{ background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: 14, marginBottom: 16 }}>
      <label style={{ ...label, marginTop: 0 }}>This entry is...</label>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setKind("customer")} style={{ ...payToggle, ...(kind === "customer" ? payToggleActive : {}) }}>Customer owes store</button>
        <button onClick={() => setKind("loan")} style={{ ...payToggle, ...(kind === "loan" ? payToggleActive : {}) }}>Store owes a lender</button>
      </div>

      <label style={label}>{kind === "customer" ? "Customer name" : "Who lent the money"}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aling Nena" style={input} />

      <label style={label}>Amount borrowed</label>
      <input value={principal} onChange={(e) => setPrincipal(e.target.value)} type="number" placeholder="0.00" style={input} />

      <label style={label}>Interest</label>
      <select value={interestType} onChange={(e) => setInterestType(e.target.value)} style={{ ...input, appearance: "auto" }}>
        <option value="none">No interest</option>
        <option value="flat">Flat amount added</option>
        <option value="percent-once">Percentage, one-time</option>
        <option value="percent-monthly">Percentage, growing monthly</option>
      </select>

      {interestType !== "none" && (
        <>
          <label style={label}>{interestType === "flat" ? "Flat amount (₱)" : "Rate (%)"}</label>
          <input value={interestValue} onChange={(e) => setInterestValue(e.target.value)} type="number" placeholder="0" style={input} />
        </>
      )}

      <label style={label}>Notes</label>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Borrowed to buy stock for fiesta rush" style={input} />

      <button
        disabled={!canSubmit}
        onClick={() => onAdd({ kind, name: name.trim(), principal: Number(principal), interest_type: interestType, interest_value: Number(interestValue) || 0, notes: notes.trim() })}
        style={{ ...btnPrimary, width: "100%", marginTop: 16, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed" }}
      >
        Save entry
      </button>
    </div>
  );
}

function PaymentInput({ onConfirm, onCancel, max }) {
  const [amount, setAmount] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder={`Up to ${peso(max)}`} style={{ ...input, flex: 1 }} />
      <button onClick={() => amount > 0 && onConfirm(Number(amount))} style={{ ...btnSmall, width: "auto", padding: "8px 14px" }}>Confirm</button>
      <button onClick={onCancel} style={{ ...linkBtn, padding: "8px 4px" }}>Cancel</button>
    </div>
  );
}
