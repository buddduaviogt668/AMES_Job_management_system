import React from "react";

export default function StatCard({ icon: Icon, label, value, subtext, tone = "navy", onClick }) {
  const iconColor = tone === "navy" ? "var(--navy)" : tone === "amber" ? "var(--amber)" : "var(--ink-soft)";
  return (
    <div className="stat-card" onClick={onClick} style={onClick ? { cursor: "pointer" } : { cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
          {label}
        </span>
        {Icon && (
          <span
            style={{
              background: "var(--primary-light)",
              padding: 7,
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={17} color={iconColor} />
          </span>
        )}
      </div>
      <div className="brand-font" style={{ fontSize: 30, fontWeight: 700, color: "var(--text-dark)", lineHeight: 1.1, marginTop: 8 }}>
        {value}
      </div>
      {subtext && <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 6 }}>{subtext}</div>}
    </div>
  );
}
