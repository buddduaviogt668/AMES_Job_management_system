import React, { useState } from "react";
import { Plus, Trash2, X, Receipt, FileText, DollarSign } from "lucide-react";
import { toast } from "./common/Toasts";

const CATEGORIES = ["Travel", "Meals", "Professional Services", "Software & Tools", "Insurance", "Certification Fees", "Marketing", "Office", "Other"];
const PAYMENT_METHODS = ["Credit Card", "Bank Transfer", "Cash", "EFTPOS"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (n) => "$" + (isFinite(n) ? n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");

const TODAY = new Date().toISOString().slice(0, 10);

const emptyForm = {
  date: TODAY,
  category: CATEGORIES[0],
  description: "",
  amount: "",
  gstIncluded: false,
  paymentMethod: PAYMENT_METHODS[0],
  reimbursable: false,
  note: "",
  receiptName: null,
  receiptData: null,
};

const monthKey = (dateStr) => dateStr.slice(0, 7);

const monthShort = (key) => {
  const [y, m] = key.split("-");
  return MONTHS_SHORT[parseInt(m, 10) - 1] + " " + y;
};

const monthFull = (key) => {
  const [y, m] = key.split("-");
  return MONTHS_FULL[parseInt(m, 10) - 1] + " " + y;
};

const lastSixMonthKeys = () => {
  const keys = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
  }
  return keys;
};

export default function Expenses({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const thisMonthKey = monthKey(TODAY);
  const thisMonthTotal = expenses
    .filter((e) => monthKey(e.date) === thisMonthKey)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const monthNum = parseInt(TODAY.slice(5, 7), 10);
  const fyStart = (monthNum >= 7 ? TODAY.slice(0, 4) : String(parseInt(TODAY.slice(0, 4), 10) - 1)) + "-07-01";
  const fyEnd = (monthNum >= 7 ? String(parseInt(TODAY.slice(0, 4), 10) + 1) : TODAY.slice(0, 4)) + "-06-30";
  const fyExpenses = expenses.filter((e) => e.date >= fyStart && e.date <= fyEnd);
  const fyTotal = fyExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const gstPaidFY = fyExpenses.filter((e) => e.gstIncluded).reduce((s, e) => s + (Number(e.amount) || 0) * 0.1, 0);
  const reimbursableTotal = expenses.filter((e) => e.reimbursable).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const groups = [];
  sorted.forEach((ex) => {
    const key = monthKey(ex.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(ex);
    else groups.push({ key, items: [ex] });
  });

  const summaryRows = lastSixMonthKeys().map((key) => {
    const rows = expenses.filter((e) => monthKey(e.date) === key);
    return {
      key,
      count: rows.length,
      total: rows.reduce((s, e) => s + (Number(e.amount) || 0), 0),
      gst: rows.filter((e) => e.gstIncluded).reduce((s, e) => s + (Number(e.amount) || 0) * 0.1, 0),
    };
  });

  const openNewModal = () => {
    setEditingExpense(null);
    setForm({ ...emptyForm, date: TODAY });
    setIsModalOpen(true);
  };

  const openEditModal = (ex) => {
    setEditingExpense(ex);
    setForm({
      date: ex.date || TODAY,
      category: CATEGORIES.includes(ex.category) ? ex.category : CATEGORIES[0],
      description: ex.description || "",
      amount: ex.amount !== undefined && ex.amount !== null ? String(ex.amount) : "",
      gstIncluded: !!ex.gstIncluded,
      paymentMethod: PAYMENT_METHODS.includes(ex.paymentMethod) ? ex.paymentMethod : PAYMENT_METHODS[0],
      reimbursable: !!ex.reimbursable,
      note: ex.note || "",
      receiptName: ex.receiptName || null,
      receiptData: ex.receiptData || null,
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, receiptName: file.name, receiptData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setForm((f) => ({ ...f, receiptName: null, receiptData: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.date) return;
    const payload = {
      date: form.date,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      gstIncluded: !!form.gstIncluded,
      paymentMethod: form.paymentMethod,
      reimbursable: !!form.reimbursable,
      note: form.note,
      receiptName: form.receiptName || null,
      receiptData: form.receiptData || null,
    };
    if (editingExpense) {
      onUpdateExpense({ ...editingExpense, ...payload });
    } else {
      onAddExpense({ id: "exp_" + Date.now(), ...payload });
    }
    setIsModalOpen(false);
    toast("Expense saved", "success");
  };

  const kpis = [
    { label: "This Month Total", value: fmt(thisMonthTotal) },
    { label: "This FY Total", value: fmt(fyTotal) },
    { label: "GST Paid this FY", value: fmt(gstPaidFY) },
    { label: "Reimbursable", value: fmt(reimbursableTotal) },
  ];

  const fieldStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    fontSize: 14,
    marginTop: 4,
    background: "#ffffff",
  };

  const labelStyle = { fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" };

  const isReceiptImage = form.receiptData && form.receiptData.startsWith("data:image");

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)", letterSpacing: "-0.01em" }}>
            Expense Tracker
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>
            Categorised business expenses with monthly totals and GST tracking.
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
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: 20,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                {kpi.label}
              </span>
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
                <DollarSign size={16} color="var(--navy)" />
              </span>
            </div>
            <div className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)", lineHeight: 1.15, marginTop: 8 }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 ? (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "60px 24px",
            boxShadow: "var(--shadow-sm)",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <span
              style={{
                background: "var(--primary-light)",
                padding: 12,
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Receipt size={26} color="var(--navy)" />
            </span>
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            No expenses recorded yet — click Add Expense to start.
          </p>
        </div>
      ) : (
        <>
          {groups.map((group) => {
            const groupTotal = group.items.reduce((s, e) => s + (Number(e.amount) || 0), 0);
            return (
              <div key={group.key} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--navy)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    margin: "28px 0 12px",
                  }}
                >
                  {monthFull(group.key)} — {fmt(groupTotal)}
                </div>
                {group.items.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "14px 20px",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "var(--primary-light)",
                          color: "var(--navy)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ex.category}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{ex.description}</div>
                        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 1 }}>
                          {ex.date} {ex.note ? "· " + ex.note : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {ex.gstIncluded && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: "var(--amber-pale)",
                              color: "var(--amber-dim)",
                            }}
                          >
                            GST
                          </span>
                        )}
                        {ex.reimbursable && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: "var(--success-bg)",
                              color: "var(--success)",
                            }}
                          >
                            Reimbursable
                          </span>
                        )}
                        {ex.receiptData && (
                          <span title={ex.receiptName || "Receipt attached"} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            <Receipt size={15} color="var(--ink-soft)" />
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", textAlign: "right", minWidth: 84 }}>
                        {fmt(Number(ex.amount) || 0)}
                      </span>

                      <button
                        onClick={() => openEditModal(ex)}
                        title="Edit Expense"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-color)",
                          background: "#ffffff",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--ink)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteExpense(ex.id)}
                        title="Delete Expense"
                        style={{
                          padding: "6px 9px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--danger-bg)",
                          background: "var(--danger-bg)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--danger)",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: 20,
              boxShadow: "var(--shadow-sm)",
              marginTop: 32,
              overflowX: "auto",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
              Monthly Totals — Last 6 Months
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--navy)" }}>
                  {["Month", "Entries", "Total", "GST Paid"].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: "#ffffff",
                        textTransform: "uppercase",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.6px",
                        padding: "10px 12px",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.key} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
                      {monthShort(row.key)}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--ink-soft)" }}>{row.count}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--ink)", fontWeight: 700 }}>{fmt(row.total)}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--ink-soft)" }}>{fmt(row.gst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: 560,
              padding: 24,
              boxShadow: "var(--shadow-lg)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="var(--ink-soft)" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={fieldStyle}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Airport parking, client meeting lunch..."
                  style={fieldStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Amount ex GST</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} style={fieldStyle}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.gstIncluded}
                    onChange={(e) => setForm({ ...form, gstIncluded: e.target.checked })}
                  />
                  GST included on this amount
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.reimbursable}
                    onChange={(e) => setForm({ ...form, reimbursable: e.target.checked })}
                  />
                  Reimbursable
                </label>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Optional context for this expense..."
                  style={fieldStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Receipt</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px dashed var(--border-color)",
                    fontSize: 13,
                    marginTop: 4,
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                />
                {form.receiptName && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 8,
                      padding: "8px 10px",
                      background: "var(--bg-main)",
                      borderRadius: 6,
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    {isReceiptImage ? (
                      <img
                        src={form.receiptData}
                        alt={form.receiptName}
                        style={{ height: 36, width: 36, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                      />
                    ) : (
                      <FileText size={18} color="var(--ink-soft)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 12.5, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {form.receiptName}
                    </span>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      title="Remove receipt"
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <X size={14} color="var(--ink-soft)" />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    background: "#ffffff",
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: "var(--navy)",
                    color: "#ffffff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
