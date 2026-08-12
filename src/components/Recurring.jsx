import React, { useState } from "react";
import {
  Plus,
  Trash2,
  X,
  RefreshCw,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "./common/Toasts";

const FREQUENCIES = ["Annual", "5 Yearly", "2 Yearly", "Monthly", "Quarterly"];
const CATEGORIES = ["Licence", "Certification", "Audit", "Insurance", "Other"];

const FREQ_LABEL = {
  Annual: "Every 1 year",
  "5 Yearly": "Every 5 years",
  "2 Yearly": "Every 2 years",
  Monthly: "Every 1 month",
  Quarterly: "Every 3 months",
};

const EMPTY_FORM = {
  title: "",
  category: "Licence",
  frequency: "Annual",
  lastRenewed: "",
  nextDue: "",
  notes: "",
  completed: false,
};

const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseDate = (s) => {
  if (!s) return null;
  const parts = s.split("-");
  return new Date(Number(parts[0]), (Number(parts[1]) || 1) - 1, Number(parts[2]) || 1);
};

const fmtDate = (s) =>
  s ? parseDate(s).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "";

const daysUntil = (s, todayStr) => {
  const d = parseDate(s);
  const t = parseDate(todayStr);
  if (!d || !t) return null;
  return Math.round((d.getTime() - t.getTime()) / 86400000);
};

const advanceDate = (s, frequency) => {
  const d = parseDate(s) || new Date();
  if (frequency === "Annual") d.setFullYear(d.getFullYear() + 1);
  else if (frequency === "5 Yearly") d.setFullYear(d.getFullYear() + 5);
  else if (frequency === "2 Yearly") d.setFullYear(d.getFullYear() + 2);
  else if (frequency === "Monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "Quarterly") d.setMonth(d.getMonth() + 3);
  return toYMD(d);
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  padding: 20,
  boxShadow: "var(--shadow-sm)",
};

export default function Recurring({ recurringItems, onAddItem, onUpdateItem, onDeleteItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const items = Array.isArray(recurringItems) ? recurringItems : [];
  const today = toYMD(new Date());

  const stats = items.reduce(
    (acc, it) => {
      const d = daysUntil(it.nextDue, today);
      if (!it.completed && d !== null && d < 0) acc.overdue += 1;
      if (!it.completed && d !== null && d >= 0 && d <= 30) acc.dueSoon += 1;
      if (it.completed) acc.completed += 1;
      acc.total += 1;
      return acc;
    },
    { overdue: 0, dueSoon: 0, completed: 0, total: 0 }
  );

  const statusOf = (it) => {
    if (it.completed) return { label: "Done", bg: "var(--success-bg)", color: "var(--success)" };
    const d = daysUntil(it.nextDue, today);
    if (d !== null && d < 0) return { label: "Overdue", bg: "var(--danger-bg)", color: "var(--danger)" };
    if (d !== null && d <= 30) return { label: "Due soon", bg: "var(--warning-bg)", color: "var(--warning-text)" };
    return { label: "Scheduled", bg: "var(--primary-light)", color: "var(--ink-soft)" };
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      category: item.category || "Licence",
      frequency: item.frequency || "Annual",
      lastRenewed: item.lastRenewed || "",
      nextDue: item.nextDue || "",
      notes: item.notes || "",
      completed: !!item.completed,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const item = { ...formData, id: editingItem ? editingItem.id : "rec_" + Date.now() };
    if (editingItem) {
      onUpdateItem(item);
    } else {
      onAddItem(item);
    }
    toast("Recurring item saved", "success");
    setIsModalOpen(false);
  };

  const handleRenew = (item) => {
    onUpdateItem({
      ...item,
      completed: true,
      lastRenewed: today,
      nextDue: advanceDate(item.nextDue, item.frequency),
    });
    toast("Renewed — next due updated", "success");
  };

  const handleReset = (item) => {
    onUpdateItem({ ...item, completed: false });
    toast("Recurring item reset", "success");
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    onDeleteItem(item.id);
    toast("Recurring item deleted", "info");
  };

  const kpiCards = [
    {
      label: "Due within 30 days",
      value: stats.dueSoon,
      color: stats.dueSoon > 0 ? "var(--amber-dim)" : "var(--ink-mid)",
      icon: <CalendarClock size={16} />,
    },
    {
      label: "Overdue",
      value: stats.overdue,
      color: stats.overdue > 0 ? "var(--danger)" : "var(--success)",
      icon: <RefreshCw size={16} />,
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "var(--success)",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "Total items",
      value: stats.total,
      color: "var(--ink-mid)",
      icon: <CalendarClock size={16} />,
    },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            Recurring Compliance
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>
            Licence renewals, certifications and annual reviews — auto-due-date reminders.
          </p>
        </div>

        <button
          onClick={openNewModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--navy)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {kpiCards.map((card) => (
          <div key={card.label} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {card.icon}
              <span>{card.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: card.color, marginTop: 6 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            padding: 40,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CalendarClock size={34} color="var(--accent)" />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>
            No recurring compliance items yet.
          </h3>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4 }}>
            Add your first licence renewal or certification to start tracking due dates.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Recurring items ({items.length})
          </h3>

          {items.map((item) => {
            const status = statusOf(item);
            return (
              <div
                key={item.id}
                style={{
                  ...cardStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    onClick={() => openEditModal(item)}
                    title="Edit item"
                    style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", cursor: "pointer" }}
                  >
                    {item.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "var(--primary-light)",
                        color: "var(--navy)",
                      }}
                    >
                      {item.category}
                    </span>
                    <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                      {FREQ_LABEL[item.frequency] || item.frequency}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    Next due: {fmtDate(item.nextDue) || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => handleRenew(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "#ffffff",
                        border: "1px solid var(--success)",
                        color: "var(--success)",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Renew / Mark done</span>
                    </button>
                    <button
                      onClick={() => handleReset(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "none",
                        border: "1px solid var(--border-color)",
                        color: "var(--ink-soft)",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Delete item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34,
                        height: 34,
                        borderRadius: "var(--radius-sm)",
                        background: "none",
                        border: "1px solid var(--border-color)",
                        color: "var(--danger)",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: 24, textAlign: "center", fontSize: 12.5, fontStyle: "italic", color: "var(--ink-soft)" }}>
        Reminders feed the Dashboard &ldquo;Needs Attention&rdquo; list automatically.
      </p>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: 520,
              padding: 24,
              boxShadow: "var(--shadow-lg)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                {editingItem ? "Edit Recurring Item" : "Add Recurring Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="var(--ink-soft)" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Food Safety Supervisor (FSS) Renewal"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                      background: "#ffffff",
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                      background: "#ffffff",
                    }}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Last Renewed</label>
                  <input
                    type="date"
                    value={formData.lastRenewed}
                    onChange={(e) => setFormData({ ...formData, lastRenewed: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Next Due *</label>
                  <input
                    type="date"
                    required
                    value={formData.nextDue}
                    onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Submit renewal application 30 days before expiry."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    fontSize: 14,
                    marginTop: 4,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--ink)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                />
                <span>Completed</span>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "none",
                    border: "1px solid var(--border-color)",
                    color: "var(--ink-soft)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: "var(--navy)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
