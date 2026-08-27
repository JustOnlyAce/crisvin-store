export const btnPrimary = { background: "#2F5233", color: "#FAF7F0", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 14.5, fontWeight: 700, cursor: "pointer" };
export const btnGhost = { background: "transparent", color: "#2F5233", border: "1.5px solid #2F5233", borderRadius: 10, padding: "13px 20px", fontSize: 14.5, fontWeight: 700, cursor: "pointer" };
export const btnSmall = { background: "#2F5233", color: "#FAF7F0", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", width: "100%" };
export const linkBtn = { background: "none", border: "none", color: "#8C6A4A", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 };
export const label = { display: "block", fontSize: 12, fontWeight: 600, color: "#5B5346", marginBottom: 6, marginTop: 14 };
export const input = { width: "100%", boxSizing: "border-box", border: "1px solid #E4DCC9", borderRadius: 9, padding: "12px 13px", fontSize: 14, fontFamily: "'Public Sans', sans-serif", outline: "none", background: "#fff" };
export const chip = { border: "none", borderRadius: 20, padding: "8px 14px", fontSize: 12.5, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 };
export const productCard = { background: "#fff", border: "1px solid #E4DCC9", borderRadius: 12, padding: 12 };
export const qtyBtn = { background: "none", border: "none", color: "#FAF7F0", fontSize: 16, fontWeight: 700, cursor: "pointer", width: 24 };
export const qtyBtnLight = { background: "#EFEAE0", border: "none", borderRadius: 6, width: 24, height: 24, fontWeight: 700, cursor: "pointer", color: "#2B2620" };
export const sectionTitle = { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: "#2F5233", margin: "8px 0 14px" };
export const payToggle = { flex: 1, border: "1.5px solid #E4DCC9", background: "#fff", borderRadius: 9, padding: "11px 8px", fontSize: 12.5, fontWeight: 600, color: "#5B5346", cursor: "pointer" };
export const payToggleActive = { border: "1.5px solid #2F5233", background: "#E7EEE3", color: "#2F5233" };

export function TopBar({ title, subtitle, onSwitchRole }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 16px 8px", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/icon-192.png" alt="" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "cover" }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: "#2F5233" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#8C6A4A" }}>{subtitle}</div>
        </div>
      </div>
      <button onClick={onSwitchRole} style={linkBtn}>Switch</button>
    </div>
  );
}

export function EmptyState({ text }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: "#8C6A4A", fontSize: 13.5, lineHeight: 1.6 }}>{text}</div>;
}

export function StatCard({ label: l, value }) {
  return (
    <div style={{ background: "#E7EEE3", borderRadius: 12, padding: "16px 14px" }}>
      <div style={{ fontSize: 11.5, color: "#2F5233", fontWeight: 600, marginBottom: 6 }}>{l}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: "#2F5233" }}>{value}</div>
    </div>
  );
}

export function StatusPill({ status }) {
  const colors = {
    Pending: { bg: "#FBEFD9", fg: "#8C6A4A" },
    "Ready for Pickup": { bg: "#E7EEE3", fg: "#2F5233" },
    Completed: { bg: "#EFEAE0", fg: "#5B5346" },
  };
  const c = colors[status] || colors.Pending;
  return <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20 }}>{status}</span>;
}
