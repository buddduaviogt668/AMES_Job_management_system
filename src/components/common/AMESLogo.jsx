import React from "react";

export default function AMESLogo({ variant = "light", showTagline = true, size = "md" }) {
  const light = variant === "light";
  const nameSize = size === "sm" ? 17 : size === "lg" ? 30 : 20;
  const tagSize = size === "sm" ? 9 : size === "lg" ? 11.5 : 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
      <div
        className="brand-font"
        style={{
          fontSize: nameSize,
          fontWeight: 700,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
          color: light ? "#ffffff" : "var(--navy)",
          whiteSpace: "nowrap",
        }}
      >
        AMES{" "}
        <span style={{ color: "var(--amber)", fontStyle: "italic", fontWeight: 400 }}>Food Advisory</span>
      </div>
      {showTagline && (
        <div
          style={{
            fontSize: tagSize,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            lineHeight: 1,
            color: light ? "rgba(255,255,255,0.35)" : "var(--ink-muted)",
            whiteSpace: "nowrap",
          }}
        >
          NSW&nbsp;&middot;&nbsp;HACCP&nbsp;&middot;&nbsp;FOOD CONSULTANTS
        </div>
      )}
    </div>
  );
}
