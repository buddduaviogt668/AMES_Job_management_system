import React, { useState, useEffect } from "react";
import { Printer, Plus, Trash2, Copy, BadgeCheck, Undo2 } from "lucide-react";
import { AMES_PRICING_CATALOG } from "../data/pricingCatalog";
import AMESLogo from "./common/AMESLogo";
import { toast } from "./common/Toasts";

const lineItemsOf = (inv) => (Array.isArray(inv && inv.lineItems) ? inv.lineItems : []);

const fmtMoney = (n) => (isFinite(n) ? n.toFixed(2) : "0.00");

const metaInput = (value, onChange, { width = "auto", bold = false, font = "inherit", size = 12 } = {}) => (
  <input
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "transparent",
      border: "none",
      borderBottom: "1px dashed var(--border-color)",
      borderRadius: 0,
      fontSize: size,
      color: "var(--ink-mid)",
      fontWeight: bold ? 700 : 600,
      outline: "none",
      width,
      fontFamily: font,
    }}
  />
);

const TERMS_FALLBACK =
  "Standard terms: payment due 14 days from invoice date. 50% deposit applies to commence engagement, balance on delivery of final documentation.";

export default function InvoiceGenerator({
  invoices,
  clients,
  settings,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onUpdateSettings,
}) {
  const [selectedInvoice, setSelectedInvoice] = useState(() => invoices[0] || null);
  const [isCreating, setIsCreating] = useState(false);
  const [metaDraft, setMetaDraft] = useState(() => ({
    businessName: settings?.businessName || "AMES Food Advisory",
    abn: settings?.abn || "61 136 364 150",
    tagline: settings?.tagline || "Sydney & NSW Food Safety Compliance Specialists",
    website: settings?.website || "amesfoodadvisory.com.au",
    phone: settings?.phone || "(02) 7822 0109",
    signature: settings?.signature || "AMES Food Advisory — Ann-Marie Skarmoutsos",
  }));

  useEffect(() => {
    setMetaDraft({
      businessName: settings?.businessName || "AMES Food Advisory",
      abn: settings?.abn || "61 136 364 150",
      tagline: settings?.tagline || "Sydney & NSW Food Safety Compliance Specialists",
      website: settings?.website || "amesfoodadvisory.com.au",
      phone: settings?.phone || "(02) 7822 0109",
      signature: settings?.signature || "AMES Food Advisory — Ann-Marie Skarmoutsos",
    });
  }, [settings]);

  const setMeta = (key) => (val) => setMetaDraft((d) => ({ ...d, [key]: val }));
  const setInv = (patch) => setSelectedInvoice((prev) => (prev ? { ...prev, ...patch } : prev));

  const getNextInvoiceNumber = () => {
    const maxNum = invoices.reduce((acc, inv) => {
      const match = inv && inv.invoiceNumber && String(inv.invoiceNumber).match(/^AFA-(\d+)$/);
      return match ? Math.max(acc, parseInt(match[1], 10)) : acc;
    }, 100009);
    if (isCreating && selectedInvoice) {
      const m = String(selectedInvoice.invoiceNumber).match(/^AFA-(\d+)$/);
      if (m) return `AFA-${Math.max(maxNum, parseInt(m[1], 10)) + 1}`;
    }
    return `AFA-${maxNum + 1}`;
  };

  const handleApplyClient = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setSelectedInvoice((prev) => ({
      ...prev,
      clientName: client.clientName || "",
      businessName: client.businessName || client.clientName || "",
      email: client.email || "",
      address: client.address || "",
    }));
  };

  const handleOpenNewInvoice = () => {
    const first = clients[0] || {};
    const newInv = {
      id: "inv_" + Date.now(),
      invoiceNumber: getNextInvoiceNumber(),
      clientName: first.clientName || "",
      businessName: first.businessName || first.clientName || "",
      email: first.email || "",
      address: first.address || "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "Unpaid",
      terms: settings?.invoiceTerms || TERMS_FALLBACK,
      lineItems: [
        { description: "Site Audit / Gap Assessment Fee (Phase 1)", priceExGst: 595.0, qty: 1 },
      ],
    };
    setSelectedInvoice(newInv);
    setIsCreating(true);
    toast(`New draft ${newInv.invoiceNumber} ready — fill in details, then Save Invoice Record`, "info");
  };

  const handleAddLineFromCatalog = (catalogItem) => {
    setSelectedInvoice((prev) => ({
      ...prev,
      lineItems: [...lineItemsOf(prev), { description: catalogItem.name, priceExGst: catalogItem.priceExGst, qty: 1 }],
    }));
  };

  const handleUpdateLine = (idx, patch) => {
    setSelectedInvoice((prev) => {
      const items = lineItemsOf(prev).map((it, i) => (i === idx ? { ...it, ...patch } : it));
      return { ...prev, lineItems: items };
    });
  };

  const handleRemoveLineItem = (idx) => {
    setSelectedInvoice((prev) => ({ ...prev, lineItems: lineItemsOf(prev).filter((_, i) => i !== idx) }));
  };

  const handleSaveInvoice = () => {
    if (!selectedInvoice) return;
    const metaChanged = ["businessName", "abn", "tagline", "website", "phone", "signature"].some(
      (k) => metaDraft[k] !== (settings && settings[k])
    );
    if (metaChanged && onUpdateSettings) onUpdateSettings(metaDraft);
    const clean = {
      ...selectedInvoice,
      lineItems: lineItemsOf(selectedInvoice),
      terms: selectedInvoice.terms || metaDraft.invoiceTerms || TERMS_FALLBACK,
      issueDate: selectedInvoice.issueDate || new Date().toISOString().split("T")[0],
      dueDate: selectedInvoice.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: selectedInvoice.status || "Unpaid",
    };
    if (isCreating) {
      onAddInvoice(clean);
      setIsCreating(false);
      toast("Invoice created and saved", "success");
    } else {
      onUpdateInvoice(clean);
      toast("Invoice saved", "success");
    }
  };

  const handleTogglePaid = () => {
    if (!selectedInvoice) return;
    const isPaid = selectedInvoice.status === "Paid";
    onUpdateInvoice({
      ...selectedInvoice,
      status: isPaid ? "Unpaid" : "Paid",
      paidDate: isPaid ? undefined : new Date().toISOString().split("T")[0],
    });
    setSelectedInvoice((prev) => ({
      ...prev,
      status: isPaid ? "Unpaid" : "Paid",
      paidDate: isPaid ? undefined : new Date().toISOString().split("T")[0],
    }));
    toast(isPaid ? "Invoice marked as unpaid" : "Invoice marked as paid", "success");
  };

  const handleDeleteInvoice = () => {
    if (!selectedInvoice) return;
    if (!window.confirm(`Delete invoice ${selectedInvoice.invoiceNumber}? This cannot be undone.`)) return;
    onDeleteInvoice(selectedInvoice.id);
    const remaining = invoices.filter((i) => i.id !== selectedInvoice.id);
    setSelectedInvoice(remaining[0] || null);
    setIsCreating(false);
    toast("Invoice deleted", "info");
  };

  const handleChase = () => {
    if (!selectedInvoice) return;
    const t = selectedInvoice;
    const sub = lineItemsOf(t).reduce((acc, it) => acc + (Number(it.priceExGst) || 0) * (Number(it.qty) || 1), 0);
    const total = sub * 1.1;
    const text =
      `Hi ${t.clientName || "there"},\n\n` +
      `A gentle reminder that invoice ${t.invoiceNumber} for ${t.businessName || ""} is now ${t.dueDate ? `due (${t.dueDate})` : "due"}.\n` +
      `Total outstanding: $${fmtMoney(total)} incl GST.\n\n` +
      `Payment can be made via bank transfer or credit card — happy to resend the invoice.\n\n` +
      `Kind regards,\nAMES Food Advisory\n${metaDraft.phone} · ${metaDraft.website}`;
    navigator.clipboard?.writeText(text).then(
      () => toast("Chase-up email copied to clipboard", "success"),
      () => toast("Could not copy to clipboard", "error")
    );
  };

  const subtotalExGst = selectedInvoice
    ? lineItemsOf(selectedInvoice).reduce((acc, it) => acc + (Number(it.priceExGst) || 0) * (Number(it.qty) || 1), 0)
    : 0;
  const gstAmount = subtotalExGst * 0.1;
  const totalInclGst = subtotalExGst + gstAmount;

  return (
    <div className="invoice-page" style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Action Bar */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            Tax Invoice Generator
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 3 }}>
            Official AMES Food Advisory invoicing — sequential from AFA-100010, ex GST + 10% GST.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {selectedInvoice && (
            <button className="btn btn-secondary" onClick={handleChase} title="Copy payment chase email">
              <Copy size={15} /> Chase
            </button>
          )}
          {selectedInvoice && (
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={15} /> Print / Save PDF
            </button>
          )}
          <button className="btn btn-primary" onClick={handleOpenNewInvoice}>
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      <div className="invoice-layout" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Left Column: Invoice History List */}
        <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Invoice History ({invoices.length})
          </h3>

          {invoices.length === 0 && (
            <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--ink-muted)", fontSize: 13, border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)" }}>
              No invoices yet. Click "Create Invoice" to start.
            </div>
          )}

          {invoices.map((inv) => {
            const isSelected = selectedInvoice?.id === inv.id;
            const sub = lineItemsOf(inv).reduce((acc, it) => acc + (Number(it.priceExGst) || 0) * (Number(it.qty) || 1), 0);
            const tot = sub * 1.1;
            const paid = inv.status === "Paid";
            return (
              <div
                key={inv.id}
                onClick={() => {
                  setSelectedInvoice(inv);
                  setIsCreating(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: "var(--radius-sm)",
                  border: isSelected ? "2px solid var(--navy)" : "1px solid var(--border-color)",
                  background: isSelected ? "#f4f6f8" : "#ffffff",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                    {inv.invoiceNumber}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: paid ? "var(--success-bg)" : "var(--warning-bg)",
                      color: paid ? "var(--success)" : "var(--warning-text)",
                    }}
                  >
                    {paid ? "PAID" : "UNPAID"}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginTop: 4 }}>
                  {inv.businessName}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                  Total: <strong>${fmtMoney(tot)} incl GST</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Branded Tax Invoice Document */}
        {selectedInvoice ? (
          <div
            className="print-doc"
            style={{
              background: "#ffffff",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)",
              overflow: "hidden",
            }}
          >
            {/* Document Header — website header + logo */}
            <div style={{ background: "var(--navy-deep)", padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <AMESLogo variant="light" size="lg" />
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="brand-font" style={{ fontSize: 22, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.02em" }}>
                  TAX INVOICE
                </div>
                <input
                  className="mono"
                  value={selectedInvoice.invoiceNumber || ""}
                  onChange={(e) => setInv({ invoiceNumber: e.target.value })}
                  title="Invoice number — editable"
                  style={{
                    fontSize: 16, fontWeight: 700, color: "#ffffff", marginTop: 2, textAlign: "right",
                    background: "transparent", border: "none", borderBottom: "1px dashed rgba(255,255,255,0.35)", outline: "none",
                    fontFamily: "var(--font-mono)", width: 210,
                  }}
                />
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 6 }}>
                  OFFICIAL
                </div>
              </div>
            </div>

            <div style={{ padding: "32px 40px" }}>
              {/* Meta row */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  <strong style={{ color: "var(--ink-mid)" }}>
                    {metaInput(metaDraft.businessName, setMeta("businessName"), { width: 200, bold: true })}
                  </strong> &nbsp;·&nbsp; ABN: {metaInput(metaDraft.abn, setMeta("abn"), { width: 130, font: "var(--font-mono)" })}
                  <br />
                  {metaInput(metaDraft.tagline, setMeta("tagline"), { width: 300 })}
                  &nbsp;·&nbsp; {metaInput(metaDraft.website, setMeta("website"), { width: 190 })}
                  &nbsp;·&nbsp; {metaInput(metaDraft.phone, setMeta("phone"), { width: 110 })}
                </div>
                <div style={{ display: "flex", gap: 24, fontSize: 12.5 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.04em" }}>Date</div>
                    <input
                      type="date"
                      value={selectedInvoice.issueDate || ""}
                      onChange={(e) => setInv({ issueDate: e.target.value })}
                      style={{ fontSize: 12.5, border: "1px solid var(--border-color)", borderRadius: 4, padding: "2px 4px", color: "var(--ink)", width: 132 }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.04em" }}>Due Date</div>
                    <input
                      type="date"
                      value={selectedInvoice.dueDate || ""}
                      onChange={(e) => setInv({ dueDate: e.target.value })}
                      style={{ fontSize: 12.5, border: "1px solid var(--border-color)", borderRadius: 4, padding: "2px 4px", color: "var(--ink)", width: 132 }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.04em" }}>Status</div>
                    <div style={{ color: selectedInvoice.status === "Paid" ? "var(--success)" : "var(--amber-dim)", fontWeight: 700 }}>
                      {selectedInvoice.status === "Paid" ? `PAID${selectedInvoice.paidDate ? ` ${selectedInvoice.paidDate}` : ""}` : "UNPAID"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ marginBottom: 24, background: "var(--stone)", padding: 16, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--amber-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Bill To
                  </div>
                  <select
                    className="no-print"
                    value=""
                    onChange={(e) => e.target.value && handleApplyClient(e.target.value)}
                    style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff" }}
                  >
                    <option value="">Link from CRM...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.businessName}</option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>
                  <input
                    value={selectedInvoice.businessName || ""}
                    onChange={(e) => setInv({ businessName: e.target.value })}
                    placeholder="Business name"
                    style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%" }}
                  />
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dark)" }}>
                  Attn:{" "}
                  <input
                    value={selectedInvoice.clientName || ""}
                    onChange={(e) => setInv({ clientName: e.target.value })}
                    placeholder="Contact name"
                    style={{ fontSize: 13, color: "var(--text-dark)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: 220 }}
                  />
                </div>
                <input
                  value={selectedInvoice.address || ""}
                  onChange={(e) => setInv({ address: e.target.value })}
                  placeholder="Street address"
                  style={{ fontSize: 12.5, color: "var(--ink-soft)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%", display: "block", marginTop: 2 }}
                />
                <input
                  value={selectedInvoice.email || ""}
                  onChange={(e) => setInv({ email: e.target.value })}
                  placeholder="Email address"
                  style={{ fontSize: 12.5, color: "var(--ink-soft)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%", display: "block", marginTop: 2 }}
                />
              </div>

              {/* Quick Catalog Adder */}
              <div className="no-print" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  + Quick Add Service:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {AMES_PRICING_CATALOG.map((cat) => (
                    <button
                      key={cat.id}
                      className="btn btn-outline"
                      onClick={() => handleAddLineFromCatalog(cat)}
                      style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999 }}
                    >
                      + {cat.name} (${cat.priceExGst} ex GST)
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left", marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: "var(--navy)", color: "#ffffff" }}>
                    <th style={{ padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.03em" }}>Description</th>
                    <th style={{ padding: "10px 12px", width: 60, textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "10px 12px", width: 130, textAlign: "right" }}>Price (ex GST)</th>
                    <th style={{ padding: "10px 12px", width: 130, textAlign: "right" }}>Amount (ex GST)</th>
                    <th style={{ padding: "10px 12px", width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItemsOf(selectedInvoice).length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: "18px 12px", textAlign: "center", color: "var(--ink-muted)", fontSize: 12.5 }}>
                        No line items yet — add a service above.
                      </td>
                    </tr>
                  )}
                  {lineItemsOf(selectedInvoice).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--stone-mid)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) => handleUpdateLine(idx, { description: e.target.value })}
                          style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, color: "var(--text-dark)", fontWeight: 600 }}
                        />
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="1"
                          value={Number(item.qty) || 1}
                          onChange={(e) => handleUpdateLine(idx, { qty: parseInt(e.target.value, 10) || 1 })}
                          style={{ width: 52, border: "1px solid var(--border-color)", borderRadius: 4, padding: "2px 4px", textAlign: "center" }}
                        />
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        $<input
                          type="number"
                          step="0.01"
                          value={Number(item.priceExGst) || 0}
                          onChange={(e) => handleUpdateLine(idx, { priceExGst: parseFloat(e.target.value) || 0 })}
                          style={{ width: 80, border: "1px solid var(--border-color)", borderRadius: 4, padding: "2px 4px", textAlign: "right" }}
                        />
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>
                        ${fmtMoney((Number(item.priceExGst) || 0) * (Number(item.qty) || 1))}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <button className="no-print" onClick={() => handleRemoveLineItem(idx)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Panel */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
                <div style={{ width: 320, background: "var(--stone)", padding: 16, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 6 }}>
                    <span>Subtotal (ex GST):</span>
                    <span>${fmtMoney(subtotalExGst)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 8 }}>
                    <span>GST (10%):</span>
                    <span>${fmtMoney(gstAmount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "var(--navy)", borderTop: "1px solid var(--border-color)", paddingTop: 8 }}>
                    <span>Total (incl GST):</span>
                    <span>${fmtMoney(totalInclGst)}</span>
                  </div>
                </div>
              </div>

              {/* Document Footer */}
              <div style={{ borderTop: "2px solid var(--navy)", paddingTop: 16, marginBottom: 24 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", fontStyle: "italic" }}>
                  <textarea
                    value={selectedInvoice.terms || metaDraft.invoiceTerms || TERMS_FALLBACK}
                    onChange={(e) => setInv({ terms: e.target.value })}
                    rows={2}
                    style={{ width: "100%", fontSize: 12.5, color: "var(--ink-soft)", fontStyle: "italic", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", resize: "vertical", lineHeight: 1.5, fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 6 }}>
                  {metaInput(metaDraft.signature, setMeta("signature"), { width: 420 })} &nbsp;|&nbsp; {metaDraft.website} · {metaDraft.phone}
                </div>
              </div>

              {/* Save / Status Controls */}
              <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
                {selectedInvoice.status === "Paid" ? (
                  <button className="btn btn-secondary" onClick={handleTogglePaid}>
                    <Undo2 size={15} /> Mark Unpaid
                  </button>
                ) : (
                  <button className="btn btn-accent" onClick={handleTogglePaid}>
                    <BadgeCheck size={15} /> Mark as Paid
                  </button>
                )}
                <button className="btn btn-primary" onClick={handleSaveInvoice}>
                  Save Invoice Record
                </button>
                <button className="btn btn-outline" onClick={handleDeleteInvoice} style={{ color: "var(--danger)" }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--ink-muted)" }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🧾</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-mid)" }}>No invoice selected</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Create a new invoice or select one from the history list.</div>
            <button className="btn btn-primary" onClick={handleOpenNewInvoice} style={{ marginTop: 20 }}>
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
