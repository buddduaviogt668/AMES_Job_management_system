import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "./common/Toasts";

const fmt = (n) => "$" + (isFinite(n) ? n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");

const itemsOf = (inv) => (Array.isArray(inv && inv.lineItems) ? inv.lineItems : []);
const invSubtotal = (inv) => itemsOf(inv).reduce((acc, it) => acc + (Number(it.priceExGst) || 0) * (Number(it.qty) || 1), 0);
const invTotal = (inv) => invSubtotal(inv) * 1.1;
const invDate = (inv) => inv.issueDate || inv.paidDate || "";

const PIE_COLORS = ["#1c2b3a", "#d4751f", "#ddd4c6", "#1a6b3a"];

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  padding: 20,
  boxShadow: "var(--shadow-sm)",
};

export default function Financials({ clients, invoices, expenses }) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const fyStartYear = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const fyStart = `${fyStartYear}-07-01`;
  const fyEnd = `${fyStartYear + 1}-06-30`;
  const inCurrentFy = (dStr) => !!dStr && dStr >= fyStart && dStr <= fyEnd;

  const paidInvoices = (Array.isArray(invoices) ? invoices : []).filter((i) => i && i.status === "Paid");
  const unpaidInvoices = (Array.isArray(invoices) ? invoices : []).filter((i) => i && i.status === "Unpaid");

  const revenue = Math.round(paidInvoices.filter((i) => inCurrentFy(invDate(i))).reduce((acc, i) => acc + invTotal(i), 0) * 100) / 100;
  const outstanding = Math.round(unpaidInvoices.reduce((acc, i) => acc + invTotal(i), 0) * 100) / 100;
  const fyExpenses = (Array.isArray(expenses) ? expenses : [])
    .filter((e) => e && inCurrentFy(e.date))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const takeHome = Math.round((revenue - fyExpenses) * 100) / 100;
  const totalInvoices = (Array.isArray(invoices) ? invoices : []).length;
  const conversion = totalInvoices ? Math.round((paidInvoices.length / totalInvoices) * 100) : 0;
  const openProposals = (Array.isArray(clients) ? clients : []).filter((c) => c && c.status === "Active Proposal").length;

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-AU", { month: "short" }),
    });
  }

  const monthlyData = months.map((m) => ({
    month: m.label,
    revenue: Math.round(paidInvoices.filter((i) => invDate(i).startsWith(m.key)).reduce((acc, i) => acc + invTotal(i), 0) * 100) / 100,
  }));

  const byClient = {};
  paidInvoices.forEach((inv) => {
    const name = inv.businessName || inv.clientName || "Unknown";
    byClient[name] = (byClient[name] || 0) + invTotal(inv);
  });
  const pieData = Object.entries(byClient).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  const statusOf = (inv) => {
    if (inv.status === "Paid") return { label: "PAID", bg: "var(--success-bg)", color: "var(--success)" };
    if (inv.dueDate && inv.dueDate < todayStr) return { label: "OVERDUE", bg: "var(--danger-bg)", color: "var(--danger)" };
    return { label: "UNPAID", bg: "var(--warning-bg)", color: "var(--warning-text)" };
  };

  const handleExportCsv = () => {
    const csvCell = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Invoice Number", "Date", "Due Date", "Contact", "Business", "Subtotal Ex GST", "GST", "Total Incl GST", "Status", "Paid Date"];
    const rows = (Array.isArray(invoices) ? invoices : []).map((inv) => {
      const sub = invSubtotal(inv);
      const gst = sub * 0.1;
      return [
        inv.invoiceNumber || "",
        inv.issueDate || "",
        inv.dueDate || "",
        inv.clientName || "",
        inv.businessName || "",
        sub.toFixed(2),
        gst.toFixed(2),
        (sub + gst).toFixed(2),
        inv.status || "Unpaid",
        inv.paidDate || "",
      ];
    });
    const csvText = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ames-invoices.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("ames-invoices.csv exported for Xero import", "success");
  };

  const kpis = [
    { label: "Revenue", value: fmt(revenue), subtext: `This FY (1 Jul ${fyStartYear} - 30 Jun ${fyStartYear + 1}) · paid invoices incl GST`, color: "var(--ink)" },
    { label: "Outstanding", value: fmt(outstanding), subtext: `${unpaidInvoices.length} unpaid invoice(s) incl GST`, color: "var(--ink)" },
    { label: "Take-Home", value: fmt(takeHome), subtext: `Revenue minus this FY expenses`, color: takeHome < 0 ? "var(--danger)" : "var(--ink)" },
    { label: "Pipeline Coverage", value: openProposals, subtext: "Open proposals awaiting acceptance", color: "var(--ink)" },
    { label: "Quote Conversion", value: `${conversion}%`, subtext: `${paidInvoices.length} of ${totalInvoices} invoices paid`, color: "var(--ink)" },
  ];

  const thStyle = { padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>Financials</h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>
            Revenue, take-home income and pipeline coverage for AMES Food Advisory.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCsv} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Download size={16} /> Export Xero CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {k.label}
            </div>
            <div className="brand-font" style={{ fontSize: 26, fontWeight: 700, color: k.color, marginTop: 8 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{k.subtext}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>Monthly Revenue — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11.5, fill: "var(--ink-muted)" }}
                axisLine={{ stroke: "var(--border-color)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? "$" + (v / 1000).toFixed(1) + "k" : "$" + v)}
              />
              <Tooltip formatter={(v) => [fmt(Number(v)), "Revenue"]} />
              <Bar dataKey="revenue" name="Revenue" fill="#1c2b3a" radius={[4, 4, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>Revenue by Client</h2>
          {pieData.length === 0 ? (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)", fontSize: 13 }}>
              No paid invoices to chart yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={2}>
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11.5, color: "var(--ink-soft)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
          All Invoices <span style={{ fontWeight: 600, color: "var(--ink-muted)", fontSize: 13 }}>({totalInvoices})</span>
        </h2>
        {totalInvoices === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--ink-muted)", fontSize: 13.5, border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            No invoices yet. Create an invoice in the Tax Invoice Generator to see it here.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--navy)", color: "#ffffff", textAlign: "left" }}>
                  <th style={thStyle}>Invoice #</th>
                  <th style={thStyle}>Business</th>
                  <th style={thStyle}>Issue Date</th>
                  <th style={thStyle}>Due</th>
                  <th style={thStyle}>Total (incl GST)</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(invoices) ? invoices : []).map((inv) => {
                  const st = statusOf(inv);
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <span className="mono" style={{ fontWeight: 700, color: "var(--navy)" }}>{inv.invoiceNumber}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--ink-mid)" }}>{inv.businessName || inv.clientName || "—"}</td>
                      <td style={{ padding: "10px 12px", color: "var(--ink-mid)" }}>{inv.issueDate || "—"}</td>
                      <td style={{ padding: "10px 12px", color: "var(--ink-mid)" }}>{inv.dueDate || "—"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--ink)" }}>{fmt(invTotal(inv))}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
