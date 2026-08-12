import React, { useState, useEffect } from "react";
import { Save, CloudUpload, CloudDownload, Download, Upload, RefreshCw, CheckCircle2, CloudOff, Building2, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured } from "../lib/sync";

const field = (label, value, onChange, { type = "text", placeholder, mono = false, disabled = false } = {}) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>
    {label}
    <input
      type={type}
      value={value || ""}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "9px 12px",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
        fontSize: 13.5,
        color: "var(--ink)",
        background: disabled ? "var(--stone)" : "#ffffff",
        outline: "none",
        fontFamily: mono ? "var(--font-mono)" : "inherit",
      }}
    />
  </label>
);

const sectionCard = (title, subtitle, children) => (
  <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 22, boxShadow: "var(--shadow-sm)" }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
      {title}
    </h2>
    {subtitle && <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0 16px" }}>{subtitle}</p>}
    {!subtitle && <div style={{ height: 4 }} />}
    {children}
  </div>
);

export default function Settings({ settings, onUpdateSettings, onExportBackup, onRestoreBackup, syncStatus, onPush, onPull }) {
  const [form, setForm] = useState(settings || {});
  const restoreRef = React.useRef(null);

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const configured = syncStatus ? syncStatus.configured : isSupabaseConfigured();

  const handleSave = () => {
    onUpdateSettings(form);
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 26 }}>
        <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4 }}>
          Business profile, invoice terms, cloud sync and data backups.
        </p>
      </div>

      {/* Business Profile */}
      {sectionCard(
        <><Building2 size={16} color="var(--amber)" /> Business Profile</>,
        "Shown on invoices and proposals. Saved locally and included in cloud sync.",
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {field("Business Name", form.businessName, set("businessName"), { placeholder: "AMES Food Advisory" })}
            {field("ABN", form.abn, set("abn"), { placeholder: "61 136 364 150", mono: true })}
            {field("Phone", form.phone, set("phone"), { placeholder: "(02) 7822 0109" })}
            {field("Email", form.email, set("email"), { placeholder: "ames.food.adv@gmail.com", type: "email" })}
            {field("Website", form.website, set("website"), { placeholder: "amesfoodadvisory.com.au" })}
            {field("Address", form.address, set("address"), { placeholder: "Sydney NSW" })}
            {field("GST Rate (%)", form.gstRate, (v) => set("gstRate")(parseFloat(v) || 0), { type: "number", placeholder: "10" })}
          </div>
        </>
      )}

      <div style={{ height: 20 }} />

      {/* Invoice Terms */}
      {sectionCard(
        <><ShieldCheck size={16} color="var(--amber)" /> Invoice & Payment Terms</>,
        "Default terms text used when generating new tax invoices.",
        <>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>
            Terms & Conditions
            <textarea
              rows={4}
              value={form.invoiceTerms || ""}
              onChange={(e) => set("invoiceTerms")(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: 13.5, color: "var(--ink)", outline: "none", fontFamily: "inherit", lineHeight: 1.5, resize: "vertical" }}
            />
          </label>
        </>
      )}

      <div style={{ height: 20 }} />

      {/* Cloud Sync */}
      {sectionCard(
        <><CloudUpload size={16} color="var(--amber)" /> Cloud Sync (Supabase)</>,
        "Push the current store to the cloud or pull the latest from the cloud.",
        <>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-sm)",
              border: configured ? "1px solid var(--success-bg)" : "1px solid var(--warning-bg)",
              background: configured ? "var(--success-bg)" : "var(--warning-bg)",
              fontSize: 13, fontWeight: 600, color: configured ? "var(--success)" : "var(--warning-text)", marginBottom: 14,
            }}
          >
            {configured ? <CheckCircle2 size={16} /> : <CloudOff size={16} />}
            <span>
              {configured
                ? `Connected to Supabase${syncStatus && syncStatus.lastSyncAt ? ` · last sync ${new Date(syncStatus.lastSyncAt).toLocaleString("en-AU")}` : ""}`
                : "Not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file (copy .env.example) to enable cloud sync."}
            </span>
            {syncStatus && syncStatus.syncing && (
              <RefreshCw size={14} className="spin" style={{ marginLeft: "auto" }} />
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={() => onPush && onPush()}>
              <CloudUpload size={15} /> Push to Cloud
            </button>
            <button className="btn btn-outline" onClick={() => onPull && onPull()}>
              <CloudDownload size={15} /> Pull from Cloud
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 10 }}>
            Auto-push occurs 3 seconds after any change while connected. Pull merges the cloud copy over local data.
          </p>
          <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </>
      )}

      <div style={{ height: 20 }} />

      {/* Backup & Restore */}
      {sectionCard(
        <><Download size={16} color="var(--amber)" /> Backup & Restore</>,
        "Download a JSON snapshot of all data, or restore from a previous export.",
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={onExportBackup}>
              <Download size={15} /> Export Backup
            </button>
            <button className="btn btn-outline" onClick={() => restoreRef.current && restoreRef.current.click()}>
              <Upload size={15} /> Restore Backup
            </button>
            <input
              ref={restoreRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) onRestoreBackup(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </div>
        </>
      )}

      <div style={{ marginTop: 26, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: 140 }}>
          <Save size={15} /> Save Settings
        </button>
      </div>
    </div>
  );
}
