import React from "react";

export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: 3,
        background: "var(--stone)",
        borderRadius: 10,
        border: "1px solid var(--border-color)",
        overflowX: "auto",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            style={{
              padding: "7px 14px",
              borderRadius: 7,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              color: isActive ? "#ffffff" : "var(--ink-mid)",
              background: isActive ? "var(--navy)" : "transparent",
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
