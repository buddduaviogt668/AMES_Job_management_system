import React from "react";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 28,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
