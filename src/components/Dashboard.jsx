import React from "react";
import { Users, FileSpreadsheet, Kanban, Clock, AlertTriangle, Calendar, Plus, ArrowUpRight, UserPlus, Receipt, RefreshCw, BadgeCheck } from "lucide-react";

const fmtMoney = (n) => "$" + (isFinite(n) ? n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");
const lineItemsOf = (inv) => (Array.isArray(inv && inv.lineItems) ? inv.lineItems : []);
const invoiceTotal = (inv) => lineItemsOf(inv).reduce((a, it) => a + (Number(it.priceExGst) || 0) * (Number(it.qty) || 1), 0) * 1.1;

const todayISO = () => new Date().toISOString().split("T")[0];
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};
const fmtDay = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
const dayChip = (iso) => {
  const today = todayISO();
  if (iso === today) return "TODAY";
  if (iso === inDays(1)) return "TOMORROW";
  return fmtDay(iso);
};

export default function Dashboard({ clients, jobs, invoices, proposals, recurringItems, leads, setActiveTab, setSelectedClientForQuestionnaire }) {
  const activeProposals = proposals.filter((p) => p.status === "Approved" || p.status === "Sent").length;
  const sentProposals = proposals.filter((p) => p.status === "Sent");
  const activeJobs = jobs.filter((j) => j.status === "In Progress").length;
  const completedJobs = jobs.filter((j) => j.status === "Completed").length;
  const openLeads = leads.filter((l) => l.status === "New" || l.status === "Contacted" || l.status === "Qualified").length;

  const today = todayISO();
  const unpaidInvoices = invoices.filter((i) => i.status !== "Paid");
  const outstanding = unpaidInvoices.reduce((a, i) => a + invoiceTotal(i), 0);
  const overdueInvoices = unpaidInvoices.filter((i) => i.dueDate && i.dueDate < today);
  const overdueAmount = overdueInvoices.reduce((a, i) => a + invoiceTotal(i), 0);

  const upcomingAudits = jobs
    .filter((j) => j.scheduledDate && j.scheduledDate >= today && j.scheduledDate <= inDays(14) && j.status === "In Progress")
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  const needsAttention = [];
  sentProposals.forEach((p) => needsAttention.push({ type: "proposal", text: `Proposal awaiting acceptance — ${p.businessName}`, tone: "amber", onClick: () => setActiveTab("proposals") }));
  overdueInvoices.forEach((i) => needsAttention.push({ type: "invoice", text: `Invoice ${i.invoiceNumber} overdue — ${i.businessName}`, tone: "danger", onClick: () => setActiveTab("invoices") }));
  recurringItems.forEach((r) => {
    if (r.completed) return;
    if (r.nextDue < today) needsAttention.push({ type: "recurring", text: `Overdue: ${r.title}`, tone: "danger", onClick: () => setActiveTab("recurring") });
    else if (r.nextDue <= inDays(30)) needsAttention.push({ type: "recurring", text: `${r.title} due ${fmtDay(r.nextDue)}`, tone: "warning", onClick: () => setActiveTab("recurring") });
  });

  const highestOverdue = overdueAmount > 0 && outstanding > 0 ? (overdueAmount / outstanding) * 100 : 0;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 30, fontWeight: 700, color: "var(--navy)" }}>
            Advisory Operations Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
            Overview of client intakes, proposal pipeline, and active compliance jobs.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setActiveTab("leads")}>
            <UserPlus size={15} /> Add Lead
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab("questionnaire")}>
            <Plus size={15} /> Start Scoping Questionnaire
          </button>
        </div>
      </div>

      {/* Overdue alert banners */}
      {highestOverdue >= 30 && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: "var(--radius-md)", background: "var(--danger-bg)", border: "1px solid var(--danger)", display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--danger)", fontWeight: 600 }}>
          <AlertTriangle size={17} />
          <span>Formal chase required — {overdueAmount.toLocaleString("en-AU", { style: "currency", currency: "AUD" })} is overdue across {overdueInvoices.length} invoice(s).</span>
        </div>
      )}
      {highestOverdue > 0 && highestOverdue < 30 && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: "var(--radius-md)", background: "var(--warning-bg)", border: "1px solid var(--warning-text)", display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--warning-text)", fontWeight: 600 }}>
          <Clock size={17} />
          <span>Friendly reminder stage — {overdueInvoices.length} invoice(s) now overdue.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <KpiCard icon={Users} label="Total Clients" value={clients.length} subtext="CRM entries" onClick={() => setActiveTab("clients")} />
        <KpiCard icon={Receipt} label="Outstanding" value={fmtMoney(outstanding)} subtext={`${unpaidInvoices.length} unpaid`} color="var(--amber)" onClick={() => setActiveTab("invoices")} />
        <KpiCard icon={AlertTriangle} label="Overdue" value={overdueInvoices.length} subtext={fmtMoney(overdueAmount)} color="var(--danger)" onClick={() => setActiveTab("invoices")} />
        <KpiCard icon={FileSpreadsheet} label="Proposals Live" value={activeProposals} subtext={`${sentProposals.length} awaiting acceptance`} color="var(--navy-lift)" onClick={() => setActiveTab("proposals")} />
        <KpiCard icon={Kanban} label="Active Jobs" value={activeJobs} subtext={`${completedJobs} completed`} color="var(--success)" onClick={() => setActiveTab("jobboard")} />
        <KpiCard icon={UserPlus} label="Open Leads" value={openLeads} subtext="to qualify" color="var(--amber-dim)" onClick={() => setActiveTab("leads")} />
      </div>

      {/* Upcoming Site Audits */}
      <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} color="var(--amber)" /> Upcoming Site Audits
          </h2>
          <button onClick={() => setActiveTab("calendar")} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            Open Calendar <ArrowUpRight size={14} />
          </button>
        </div>
        {upcomingAudits.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>No audits scheduled in the next 14 days.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingAudits.map((j) => (
              <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", background: "var(--stone)" }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: j.scheduledDate === today ? "var(--danger)" : "var(--amber-dim)", background: j.scheduledDate === today ? "var(--danger-bg)" : "var(--amber-pale)", padding: "4px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
                  {dayChip(j.scheduledDate)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{j.businessName}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{j.clientName} · {j.lga} LGA{j.scheduledTime ? ` · ${j.scheduledTime}` : ""}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "var(--primary-light)", color: "var(--navy)" }}>
                  Phase {j.currentPhase}/4
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Needs Attention */}
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={15} color="var(--amber)" /> Needs Attention
          </h2>
          {needsAttention.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-muted)", padding: "8px 0" }}>
              <BadgeCheck size={15} style={{ verticalAlign: -2 }} /> All clear — nothing requires action.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {needsAttention.slice(0, 7).map((n, i) => (
                <button key={i} onClick={n.onClick} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", background: n.tone === "danger" ? "var(--danger-bg)" : n.tone === "warning" ? "var(--warning-bg)" : "var(--amber-pale)", cursor: "pointer", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: n.tone === "danger" ? "var(--danger)" : n.tone === "warning" ? "var(--warning-text)" : "var(--amber)", flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{n.text}</span>
                  <ArrowUpRight size={13} color="var(--ink-soft)" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Jobs Pipeline */}
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Jobs Pipeline</h2>
            <button onClick={() => setActiveTab("jobboard")} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              Job board <ArrowUpRight size={14} />
            </button>
          </div>
          {jobs.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-muted)", padding: "10px 0" }}>
              No active jobs. Approve a proposal and launch a job.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map((job) => {
                const pct = Math.round((job.currentPhase / 4) * 100);
                return (
                  <div key={job.id} style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", background: "#ffffff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber-dim)" }}>{job.jobNumber || "AFA-P-####"}</span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{job.businessName}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: job.status === "Completed" ? "var(--success-bg)" : "var(--warning-bg)", color: job.status === "Completed" ? "var(--success)" : "var(--warning-text)" }}>
                        {job.status === "Completed" ? "COMPLETED" : `Phase ${job.currentPhase}/4`}
                      </span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 4 }}>
                        <span>Phase {job.currentPhase}: {job.phases[job.currentPhase - 1]?.title}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--border-light)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: job.status === "Completed" ? "var(--success)" : "var(--navy)", borderRadius: 3, transition: "width 0.3s ease" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Clients */}
      <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)", marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Recent Clients</h2>
          <button onClick={() => setActiveTab("clients")} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clients.slice(0, 4).map((client) => (
            <div key={client.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", background: "var(--stone)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{client.businessName}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 1 }}>{client.clientName} • {client.lga || "LGA unassigned"} ({client.industry})</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "var(--primary-light)", color: "var(--navy)" }}>{client.status}</span>
                <button
                  onClick={() => { setSelectedClientForQuestionnaire(client); setActiveTab("questionnaire"); }}
                  style={{ fontSize: 11.5, fontWeight: 700, color: "var(--navy)", background: "none", border: "1px solid var(--border-color)", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}
                >
                  <RefreshCw size={12} style={{ verticalAlign: -2 }} /> Re-scope
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, subtext, color = "var(--navy)", onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
        padding: 16, boxShadow: "var(--shadow-sm)", cursor: "pointer", transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>{label}</span>
        <div style={{ background: "var(--primary-light)", padding: 7, borderRadius: "var(--radius-sm)", display: "flex" }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div className="brand-font" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", marginTop: 6, whiteSpace: "nowrap" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{subtext}</div>
    </div>
  );
}
