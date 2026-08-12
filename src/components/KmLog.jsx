import React, { useState } from "react";
import { Plus, Trash2, X, MapPin, Car, ExternalLink, Pencil } from "lucide-react";
import { toast } from "./common/Toasts";

const ATO_RATE = 0.88;

const fmt = (n) =>
  "$" + (isFinite(n) ? n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");

const entryKm = (e) => Math.max(0, (Number(e.odometerEnd) || 0) - (Number(e.odometerStart) || 0));

const entryClaim = (e) => entryKm(e) * ATO_RATE + (Number(e.tolls) || 0);

const hasAddress = (d) => !!d && (/,/.test(d) || /\d/.test(d));

const blankForm = () => ({
  date: new Date().toISOString().split("T")[0],
  odometerStart: "",
  odometerEnd: "",
  destination: "",
  reason: "",
  tolls: "",
  note: "",
});

function KpiCard({ label, value, subtext, icon: Icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.7px" }}>{label}</span>
        <span style={{ background: "var(--primary-light)", padding: 7, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color="var(--navy)" />
        </span>
      </div>
      <div className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)", lineHeight: 1.1, marginTop: 8 }}>{value}</div>
      {subtext && <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 6 }}>{subtext}</div>}
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--border-color)",
  fontSize: 14,
  marginTop: 4,
  background: "#fff",
  color: "var(--ink)",
};

export default function KmLog({ kmEntries, onAddKm, onUpdateKm, onDeleteKm }) {
  const entries = Array.isArray(kmEntries) ? kmEntries : [];
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleString("en-AU", { month: "long", year: "numeric" });

  const sorted = [...entries].sort(
    (a, b) => (b.date || "").localeCompare(a.date || "") || String(b.id).localeCompare(String(a.id))
  );

  const totalKm = entries.reduce((s, e) => s + entryKm(e), 0);
  const monthEntries = entries.filter((e) => (e.date || "").startsWith(monthPrefix));
  const monthKm = monthEntries.reduce((s, e) => s + entryKm(e), 0);
  const totalClaim = entries.reduce((s, e) => s + entryClaim(e), 0);
  const monthClaim = monthEntries.reduce((s, e) => s + entryClaim(e), 0);

  const openAdd = () => {
    setEditing(null);
    setForm(blankForm());
    setIsOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      date: entry.date || blankForm().date,
      odometerStart: entry.odometerStart === undefined ? "" : String(entry.odometerStart),
      odometerEnd: entry.odometerEnd === undefined ? "" : String(entry.odometerEnd),
      destination: entry.destination || "",
      reason: entry.reason || "",
      tolls: entry.tolls === undefined ? "" : String(entry.tolls),
      note: entry.note || "",
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditing(null);
  };

  const startNum = parseFloat(form.odometerStart);
  const endNum = parseFloat(form.odometerEnd);
  const km = isFinite(startNum) && isFinite(endNum) ? endNum - startNum : null;
  const tollsNum = parseFloat(form.tolls) || 0;
  const claim = km !== null && km > 0 ? km * ATO_RATE + tollsNum : null;
  const endBeforeStart = km !== null && km < 0;
  const zeroDistance = km === 0;
  const saveDisabled = !form.destination.trim() || km === null || km <= 0;

  const handleSave = () => {
    if (saveDisabled) return;
    const entry = {
      date: form.date,
      odometerStart: startNum,
      odometerEnd: endNum,
      destination: form.destination.trim(),
      reason: form.reason.trim(),
      tolls: tollsNum,
      note: form.note.trim(),
    };
    if (editing) onUpdateKm({ ...editing, ...entry });
    else onAddKm({ id: "km_" + Date.now(), ...entry });
    toast("Km log entry saved", "success");
    closeModal();
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>Kilometre Log</h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>
            Odometer-based log for site visits — ATO rate $0.88/km.
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--navy)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
        <KpiCard label="Total km" value={Math.round(totalKm).toLocaleString("en-AU")} subtext="Across all entries" icon={MapPin} />
        <KpiCard label={`${monthLabel} km`} value={Math.round(monthKm).toLocaleString("en-AU")} subtext="Site visits this month" icon={Car} />
        <KpiCard label="Total Claim" value={fmt(totalClaim)} subtext="km × $0.88 + tolls" icon={MapPin} />
        <KpiCard label="This Month Claim" value={fmt(monthClaim)} subtext={monthLabel} icon={Car} />
      </div>

      {sorted.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)", padding: 60, textAlign: "center", color: "var(--ink-muted)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Car size={40} color="var(--ink-soft)" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-mid)" }}>
            No km log entries yet — log your first site visit.
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--navy)", color: "#fff" }}>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left" }}>Date</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left" }}>Destination</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left" }}>Reason</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left" }}>Odometer</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>km</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>Tolls</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>Claim</th>
                <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: "var(--ink-mid)" }}>{e.date}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>{e.destination}</div>
                    {hasAddress(e.destination) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.destination)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 12, fontWeight: 600, textDecoration: "none", marginTop: 3 }}
                      >
                        <ExternalLink size={12} /> Open in Maps
                      </a>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--ink-soft)" }}>{e.reason || "—"}</td>
                  <td className="mono" style={{ padding: "10px 12px", whiteSpace: "nowrap", color: "var(--ink-mid)" }}>
                    {e.odometerStart} → {e.odometerEnd}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--ink-mid)" }}>{Math.round(entryKm(e)).toLocaleString("en-AU")}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--ink-mid)" }}>{fmt(e.tolls)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--navy)" }}>{fmt(entryClaim(e))}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(e)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 10px",
                          borderRadius: "var(--radius-sm)",
                          background: "transparent",
                          border: "1px solid var(--border-color)",
                          color: "var(--ink-mid)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteKm(e.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 10px",
                          borderRadius: "var(--radius-sm)",
                          background: "transparent",
                          border: "1px solid var(--danger)",
                          color: "var(--danger)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius-md)", width: "100%", maxWidth: 560, padding: 24, boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{editing ? "Edit Entry" : "Add Entry"}</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="var(--ink-soft)" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={fieldStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Odometer Start</label>
                  <input type="number" value={form.odometerStart} onChange={(e) => setForm({ ...form, odometerStart: e.target.value })} placeholder="e.g. 45210" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Odometer End</label>
                  <input type="number" value={form.odometerEnd} onChange={(e) => setForm({ ...form, odometerEnd: e.target.value })} placeholder="e.g. 45385" style={fieldStyle} />
                </div>
              </div>

              {(endBeforeStart || zeroDistance) && (
                <div style={{ fontSize: 12, color: "var(--danger)", background: "var(--danger-bg)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                  {endBeforeStart ? "End odometer must be ≥ start odometer." : "Distance must be greater than zero."}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>
                  <MapPin size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />Destination *
                </label>
                <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Montao Quality Bakery, Blacktown" style={fieldStyle} />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Reason</label>
                <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Site gap assessment — Phase 1" style={fieldStyle} />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Tolls ($)</label>
                <input type="number" step="0.01" min="0" value={form.tolls} onChange={(e) => setForm({ ...form, tolls: e.target.value })} placeholder="0.00" style={fieldStyle} />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Note</label>
                <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional details..." style={fieldStyle} />
              </div>

              <div style={{ background: "var(--stone)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--ink-mid)" }}>
                  Distance: <strong style={{ color: "var(--ink)" }}>{km !== null && km >= 0 ? `${km.toLocaleString("en-AU")} km` : "—"}</strong>
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-mid)" }}>
                  Claim: <strong style={{ color: "var(--navy)" }}>{claim !== null ? fmt(claim) : "—"}</strong>
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button
                  onClick={closeModal}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--ink-mid)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveDisabled}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: "var(--navy)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: saveDisabled ? "not-allowed" : "pointer",
                    opacity: saveDisabled ? 0.5 : 1,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <Plus size={15} /> Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
