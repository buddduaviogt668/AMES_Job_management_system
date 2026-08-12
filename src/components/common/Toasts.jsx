import React, { useState, useEffect } from "react";

let listeners = [];

function emit(message, type = "info") {
  const t = { id: Date.now() + Math.random(), message, type };
  listeners.forEach((l) => l(t));
}

export function toast(message, type = "info") {
  emit(message, type);
}

const COLORS = {
  success: { border: "#1a6b3a", bg: "#ffffff", text: "#1a1c1e" },
  error: { border: "#8a2a1a", bg: "#ffffff", text: "#1a1c1e" },
  warn: { border: "#d4751f", bg: "#ffffff", text: "#1a1c1e" },
  info: { border: "#1c2b3a", bg: "#ffffff", text: "#1a1c1e" },
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 10000,
        alignItems: "center",
      }}
    >
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div
            key={t.id}
            style={{
              background: c.bg,
              color: c.text,
              padding: "10px 18px",
              borderRadius: 8,
              borderLeft: `4px solid ${c.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              fontSize: 13,
              fontWeight: 600,
              minWidth: 220,
              textAlign: "center",
              animation: "toastUp 0.25s ease",
            }}
          >
            {t.message}
          </div>
        );
      })}
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
