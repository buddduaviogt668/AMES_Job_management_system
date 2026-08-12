import React from "react";
import { Download, Calculator, FileText } from "lucide-react";
import { toast } from "./common/Toasts";

const fmt = (n) =>
  "$" +
  (isFinite(n)
    ? n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00");

const itemsOf = (inv) => (Array.isArray(inv && inv.lineItems) ? inv.lineItems : []);

const invoiceExGst = (inv) =>
  itemsOf(inv).reduce(
    (acc, it) => acc + (Number(it.priceExGst) || 0) * (Number(it.qty) || 1),
    0
  );

const invoiceGst = (inv) => invoiceExGst(inv) * 0.1;

const fyParts = (dateStr) => {
  if (!dateStr) return null;
  const y = parseInt(String(dateStr).slice(0, 4), 10);
  const m = parseInt(String(dateStr).slice(5, 7), 10);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  return { y, m };
};

const fyStartOf = (dateStr) => {
  const p = fyParts(dateStr);
  return p ? (p.m >= 7 ? p.y : p.y - 1) : null;
};

const quarterOf = (dateStr) => {
  const p = fyParts(dateStr);
  return p ? Math.ceil(p.m / 3) : null;
};

const fyLabel = (start) => `${start}-${String(start + 1).slice(2)}`;

const inFy = (dateStr, start) => fyStartOf(dateStr) === start;

const inQuarter = (dateStr, start, q) => fyStartOf(dateStr) === start && quarterOf(dateStr) === q;

const now = new Date();
const nowY = now.getFullYear();
const nowM = now.getMonth() + 1;
const FY_START = nowM >= 7 ? nowY : nowY - 1;
const FY_LABEL = fyLabel(FY_START);
const QUARTER_LABELS = [
  `Q1 · Jul–Sep ${FY_START}`,
  `Q2 · Oct–Dec ${FY_START}`,
  `Q3 · Jan–Mar ${FY_START + 1}`,
  `Q4 · Apr–Jun ${FY_START + 1}`,
];

export default function TaxSummary({ invoices, expenses, kmEntries }) {
  const invs = Array.isArray(invoices) ? invoices : [];
  const exps = Array.isArray(expenses) ? expenses : [];
  const kms = Array.isArray(kmEntries) ? kmEntries : [];

  const paidInvoices = invs.filter((i) => i.status === "Paid");
  const fyAttributedInvoices = invs.filter(
    (i) => inFy(i.paidDate, FY_START) || inFy(i.issueDate, FY_START)
  );
  const fyPaidInvoices = paidInvoices.filter(
    (i) => inFy(i.paidDate, FY_START) || inFy(i.issueDate, FY_START)
  );
  const fyGstExpenses = exps.filter(
    (e) => e.gstIncluded && inFy(e.date, FY_START)
  );

  const gstCollectedFy = fyAttributedInvoices.reduce((acc, i) => acc + invoiceGst(i), 0);
  const gstPaidFy = fyGstExpenses.reduce(
    (acc, e) => acc + (Number(e.amount) || 0) * 0.1,
    0
  );
  const netFy = gstCollectedFy - gstPaidFy;
  const incomeFy = fyPaidInvoices.reduce((acc, i) => acc + invoiceExGst(i), 0);

  const quarters = QUARTER_LABELS.map((label, idx) => {
    const q = idx + 1;
    const collected = paidInvoices
      .filter((i) => inQuarter(i.issueDate, FY_START, q))
      .reduce((acc, i) => acc + invoiceGst(i), 0);
    const paid = exps
      .filter((e) => e.gstIncluded && inQuarter(e.date, FY_START, q))
      .reduce((acc, e) => acc + (Number(e.amount) || 0) * 0.1, 0);
    return { q, label, period: FY_LABEL, collected, paid, net: collected - paid };
  });

  const collectedTotal = quarters.reduce((acc, r) => acc + r.collected, 0);
  const paidTotal = quarters.reduce((acc, r) => acc + r.paid, 0);
  const netTotal = quarters.reduce((acc, r) => acc + r.net, 0);

  const byBusiness = {};
  fyPaidInvoices.forEach((i) => {
    const name = i.businessName || "Unnamed";
    byBusiness[name] = (byBusiness[name] || 0) + invoiceGst(i);
  });
  const collectedRows = Object.entries(byBusiness).sort((a, b) => b[1] - a[1]);
  const maxCollected = collectedRows.length ? collectedRows[0][1] : 0;

  const byCategory = {};
  fyGstExpenses.forEach((e) => {
    const cat = e.category || "Other";
    byCategory[cat] = (byCategory[cat] || 0) + (Number(e.amount) || 0) * 0.1;
  });
  const paidRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxPaid = paidRows.length ? paidRows[0][1] : 0;

  const handleExport = () => {
    const lines = [["Quarter", "Period", "GST Collected", "GST Paid", "Net GST"]];
    quarters.forEach((r) =>
      lines.push([r.label, r.period, r.collected.toFixed(2), r.paid.toFixed(2), r.net.toFixed(2)])
    );
    lines.push([
      "FY Total",
      FY_LABEL,
      collectedTotal.toFixed(2),
      paidTotal.toFixed(2),
      netTotal.toFixed(2),
    ]);
    const csv = lines
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ames-bas-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("BAS export downloaded", "success");
  };

  const th = {
    background: "var(--navy)",
    color: "#ffffff",
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    textAlign: "left",
  };
  const td = { padding: "10px 12px", fontSize: 13, borderBottom: "1px solid var(--border-light)" };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            Tax Summary &amp; BAS
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>
            GST collected vs paid, quarterly BAS view and FY figures.
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--navy)",
            background: "#ffffff",
            color: "var(--navy)",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <KpiCard
          icon={Calculator}
          label="GST Collected (FY)"
          value={fmt(gstCollectedFy)}
          color="var(--navy)"
        />
        <KpiCard
          icon={FileText}
          label="GST Paid (FY)"
          value={fmt(gstPaidFy)}
          color="var(--amber)"
        />
        <KpiCard
          icon={Calculator}
          label="Net GST (FY)"
          value={fmt(netFy)}
          color={netFy > 0 ? "var(--amber-dim)" : "var(--success)"}
        />
        <KpiCard
          icon={FileText}
          label="Income Estimate (FY)"
          value={fmt(incomeFy)}
          color="var(--success)"
        />
      </div>

      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: 20,
          boxShadow: "var(--shadow-sm)",
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
          Quarterly BAS — {FY_LABEL}
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Quarter</th>
              <th style={th}>Period</th>
              <th style={{ ...th, textAlign: "right" }}>GST Collected</th>
              <th style={{ ...th, textAlign: "right" }}>GST Paid</th>
              <th style={{ ...th, textAlign: "right" }}>Net GST</th>
              <th style={{ ...th, textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {quarters.map((r) => (
              <tr key={r.q}>
                <td style={{ ...td, fontWeight: 700, color: "var(--ink)" }}>{r.label}</td>
                <td style={{ ...td, color: "var(--ink-soft)" }}>{r.period}</td>
                <td style={{ ...td, textAlign: "right" }}>{fmt(r.collected)}</td>
                <td style={{ ...td, textAlign: "right" }}>{fmt(r.paid)}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmt(r.net)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: r.net > 0 ? "var(--warning-bg)" : "var(--success-bg)",
                      color: r.net > 0 ? "var(--warning-text)" : "var(--success)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmt(r.net)}
                  </span>
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ ...td, fontWeight: 800, color: "var(--navy)", borderBottom: "none" }}>
                FY Total
              </td>
              <td style={{ ...td, fontWeight: 700, color: "var(--ink)", borderBottom: "none" }}>
                {FY_LABEL}
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                {fmt(collectedTotal)}
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
                {fmt(paidTotal)}
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800, color: "var(--navy)", borderBottom: "none" }}>
                {fmt(netTotal)}
              </td>
              <td style={{ ...td, textAlign: "center", borderBottom: "none" }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: netTotal > 0 ? "var(--warning-bg)" : "var(--success-bg)",
                    color: netTotal > 0 ? "var(--warning-text)" : "var(--success)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(netTotal)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          style={{
            fontSize: 12,
            color: "var(--ink-muted)",
            fontStyle: "italic",
            marginTop: 12,
          }}
        >
          GST collected on a cash basis — paid invoices only. Confirm ATO accounting method before
          lodging.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
            GST Collected by Client
          </h2>
          {collectedRows.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-muted)", padding: "12px 0" }}>
              No data this FY
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {collectedRows.map(([name, val]) => (
                <div key={name}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{name}</span>
                    <span style={{ fontWeight: 700, color: "var(--navy)" }}>{fmt(val)}</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--border-light)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${maxCollected ? (val / maxCollected) * 100 : 0}%`,
                        background: "var(--navy)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
            GST Paid by Category
          </h2>
          {paidRows.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-muted)", padding: "12px 0" }}>
              No data this FY
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {paidRows.map(([cat, val]) => (
                <div key={cat}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: "var(--amber-dim)" }}>{fmt(val)}</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--border-light)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${maxPaid ? (val / maxPaid) * 100 : 0}%`,
                        background: "var(--amber)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--ink-muted)", fontStyle: "italic" }}>
        {kms.length} kilometre log entr{kms.length === 1 ? "y" : "ies"} recorded this FY — vehicle
        travel is not part of GST calculations.
      </p>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>{label}</span>
        <div
          style={{
            background: "var(--primary-light)",
            padding: 8,
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={color} />
        </div>
      </div>
      <div
        className="brand-font"
        style={{ fontSize: 28, fontWeight: 700, color, marginTop: 8 }}
      >
        {value}
      </div>
    </div>
  );
}
