import React from "react";

const TONES = {
  navy: { bg: "var(--primary-light)", color: "var(--navy)" },
  amber: { bg: "var(--amber-pale)", color: "var(--amber-dim)" },
  success: { bg: "var(--success-bg)", color: "var(--success)" },
  danger: { bg: "var(--danger-bg)", color: "var(--danger)" },
  warning: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
  neutral: { bg: "var(--stone)", color: "var(--ink-mid)" },
  muted: { bg: "var(--bg-main)", color: "var(--ink-soft)" },
};

export default function Chip({ children, tone = "neutral" }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        background: t.bg,
        color: t.color,
      }}
    >
      {children}
    </span>
  );
}
