import React, { useState } from "react";
import { Plus, Search, X, Phone, Mail, UserCheck, Trash2, UserPlus } from "lucide-react";
import { LEAD_SOURCES } from "../data/initialData";
import { toast } from "./common/Toasts";

const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

const STATUS_TONE = {
  New: { bg: "var(--primary-light)", color: "var(--navy)" },
  Contacted: { bg: "var(--amber-pale)", color: "var(--amber-dim)" },
  Qualified: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
  Converted: { bg: "var(--success-bg)", color: "var(--success)" },
  Lost: { bg: "var(--danger-bg)", color: "var(--danger)" },
};

export default function Leads({ leads, onAddLead, onUpdateLead, onDeleteLead, onConvertToClient }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    industry: "Restaurant / Café / Takeaway",
    source: "Website",
    status: "New",
    notes: "",
  });

  const filtered = leads.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesQ =
      (l.businessName || "").toLowerCase().includes(q) ||
      (l.name || "").toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  const openNew = () => {
    setEditingLead(null);
    setForm({ name: "", businessName: "", phone: "", email: "", industry: "Restaurant / Café / Takeaway", source: "Website", status: "New", notes: "" });
    setIsModalOpen(true);
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setForm({ ...lead });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.businessName || !form.name) return;
    if (editingLead) {
      onUpdateLead({ ...editingLead, ...form });
      toast("Lead updated", "success");
    } else {
      onAddLead({ ...form, id: "lead_" + Date.now(), createdDate: new Date().toISOString().split("T")[0] });
      toast("Lead added", "success");
    }
    setIsModalOpen(false);
  };

  const setStatus = (lead, status) => {
    onUpdateLead({ ...lead, status });
    toast(`Lead marked ${status}`, "info");
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            Enquiry Leads
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 2 }}>
            Track enquiries from New → Contacted → Qualified → Converted, and promote qualified leads to the CRM.
          </p>
        </div>
        <button
          onClick={openNew}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--navy)", color: "#ffffff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)" }}
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 10, background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "8px 14px", boxShadow: "var(--shadow-sm)" }}>
          <Search size={18} color="var(--ink-muted)" />
          <input
            type="text"
            placeholder="Search leads by business, contact or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", border: "none", outline: "none", fontSize: 14, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "7px 14px", borderRadius: 999, border: "1px solid var(--border-color)",
                background: statusFilter === s ? "var(--navy)" : "#ffffff", color: statusFilter === s ? "#ffffff" : "var(--ink-mid)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 50, textAlign: "center", color: "var(--ink-muted)" }}>
          <UserPlus size={30} color="var(--ink-muted)" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-mid)" }}>No leads found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Add a lead or change the filter.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((lead) => {
            const tone = STATUS_TONE[lead.status] || STATUS_TONE.New;
            return (
              <div key={lead.id} style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 18, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{lead.businessName}</span>
                      <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>— {lead.name}</span>
                      <span style={{ padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: tone.bg, color: tone.color }}>
                        {lead.status}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 6, fontSize: 12.5, color: "var(--ink-soft)" }}>
                      {lead.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {lead.phone}</span>}
                      {lead.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {lead.email}</span>}
                      <span>{lead.industry}</span>
                      <span style={{ color: "var(--ink-muted)" }}>Source: {lead.source}</span>
                      <span style={{ color: "var(--ink-muted)" }}>Added {lead.createdDate || "—"}</span>
                    </div>
                    {lead.notes && <p style={{ fontSize: 12.5, color: "var(--ink-mid)", fontStyle: "italic", marginTop: 8, background: "var(--stone)", padding: "8px 10px", borderRadius: 6 }}>"{lead.notes}"</p>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    {lead.status !== "Converted" && lead.status !== "Lost" && (
                      <button
                        onClick={() => onConvertToClient(lead)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, border: "none", background: "var(--amber)", color: "#ffffff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                      >
                        <UserCheck size={14} /> Convert to Client
                      </button>
                    )}
                    <div style={{ display: "flex", gap: 4 }}>
                      <select
                        value={lead.status}
                        onChange={(e) => setStatus(lead, e.target.value)}
                        style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 12, background: "#ffffff" }}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => openEdit(lead)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Plus size={13} color="var(--navy)" style={{ transform: "rotate(45deg)" }} />
                      </button>
                      <button onClick={() => onDeleteLead(lead.id)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--danger-bg)", background: "var(--danger-bg)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Trash2 size={13} color="var(--danger)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#ffffff", borderRadius: "var(--radius-md)", width: "100%", maxWidth: 560, padding: 24, boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{editingLead ? "Edit Lead" : "Add New Lead"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="var(--ink-muted)" />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Business Name *">
                  <input type="text" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} style={inputStyle} placeholder="e.g. Chen's Dumpling House" />
                </Field>
                <Field label="Contact Name *">
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Sarah Chen" />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Phone">
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="0400 000 000" />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="lead@example.com" />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Industry">
                  <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={inputStyle} placeholder="e.g. Restaurant / Café / Takeaway" />
                </Field>
                <Field label="Source">
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ ...inputStyle, background: "#ffffff" }}>
                    {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Notes">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} placeholder="What is the enquiry about?" />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "9px 16px", borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", fontSize: 13.5, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "9px 18px", borderRadius: 6, border: "none", background: "var(--navy)", color: "#ffffff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                  {editingLead ? "Save Changes" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, marginTop: 4, background: "#ffffff" };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>{label}</label>
      {children}
    </div>
  );
}
