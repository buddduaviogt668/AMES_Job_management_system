import React, { useState, useEffect } from "react";
import { Printer, Plus, Trash2, Copy, BadgeCheck, Undo2 } from "lucide-react";
import { AMES_PRICING_CATALOG } from "../data/pricingCatalog";
import AMESLogo from "./common/AMESLogo";
import { toast } from "./common/Toasts";
import { fullLineItemsOf, invoiceTypeOf, itemTotal, lineItemsOf } from "../lib/invoiceCalculations";

const fmtMoney = (n) => (isFinite(n) ? n.toFixed(2) : "0.00");

const metaInput = (value, onChange, { width, minWidth = "auto", bold = false, font = "inherit", size = 12, light = false } = {}) => (
  <input
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "transparent",
      border: "none",
      borderBottom: light ? "1px dashed rgba(255,255,255,0.35)" : "1px dashed var(--border-color)",
      borderRadius: 0,
      fontSize: size,
      color: light ? "rgba(255,255,255,0.9)" : "var(--ink-mid)",
      fontWeight: bold ? 700 : 600,
      outline: "none",
      width: width || "auto",
      minWidth,
      fontFamily: font,
    }}
  />
);

const TERMS_FALLBACK =
  "1. SERVICES — AMES Food Advisory provides food safety consulting, HACCP / Food Safety Program development, registration pathway advice and compliance documentation as described in the line items above.\n" +
  "2. FEES & GST — All fees are exclusive of GST unless stated. GST of 10% is payable on all taxable supplies.\n" +
  "3. DEPOSIT & BILLING — A 50% deposit is required to commence the engagement. The balance is due on delivery of final documentation. Invoices are payable within 14 days of the issue date.\n" +
  "4. RE-SCHEDULING & CANCELLATION — Site visits rescheduled with less than 48 hours notice may incur a fee equivalent to the visit charge.\n" +
  "5. COUNCIL & REGULATORY — Final approval remains at the discretion of the relevant Council or the NSW Food Authority. AMES Food Advisory is not liable for third-party decisions.\n" +
  "6. LIMITATION OF LIABILITY — Our total liability is limited to the fees paid for the services rendered. We are not liable for indirect or consequential loss.\n" +
  "7. CONFIDENTIALITY — Client information and business records are kept confidential and used solely for the delivery of this engagement.\n" +
  "8. COMPLIANCE & PROFESSIONAL STANDARDS — Services are delivered in accordance with the Australia New Zealand Food Standards Code, the Food Act 2003 (NSW) and current industry professional standards.";

export default function InvoiceGenerator({
  invoices,
  clients,
  proposals,
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
    email: settings?.email || "ames.food.adv@gmail.com",
    signature: settings?.signature || "AMES Food Advisory — Ann-Marie Skarmoutsos",
    bankName: settings?.bankName || "Commonwealth Bank of Australia",
    bankBsb: settings?.bankBsb || "062-000",
    bankAcct: settings?.bankAcct || "1234 5678",
    bankAcctName: settings?.bankAcctName || "George Skarmoutsos",
    stripeLink: settings?.stripeLink || "",
    stripeFeePct: settings?.stripeFeePct ?? 1.7,
  }));

  useEffect(() => {
    setMetaDraft({
      businessName: settings?.businessName || "AMES Food Advisory",
      abn: settings?.abn || "61 136 364 150",
      tagline: settings?.tagline || "Sydney & NSW Food Safety Compliance Specialists",
      website: settings?.website || "amesfoodadvisory.com.au",
      phone: settings?.phone || "(02) 7822 0109",
      email: settings?.email || "ames.food.adv@gmail.com",
      signature: settings?.signature || "AMES Food Advisory — Ann-Marie Skarmoutsos",
      bankName: settings?.bankName || "Commonwealth Bank of Australia",
      bankBsb: settings?.bankBsb || "062-000",
      bankAcct: settings?.bankAcct || "1234 5678",
      bankAcctName: settings?.bankAcctName || "George Skarmoutsos",
      stripeLink: settings?.stripeLink || "",
      stripeFeePct: settings?.stripeFeePct ?? 1.7,
    });
  }, [settings]);

  // Keep the visible document synchronized with the invoice list after a launch creates a new deposit invoice.
  useEffect(() => {
    if (isCreating) return;
    setSelectedInvoice((current) => {
      const newest = invoices[0] || null;
      if (newest && invoiceTypeOf(newest) === "deposit" && newest.id !== current?.id) return newest;
      return (current && invoices.find((inv) => inv.id === current.id)) || newest;
    });
  }, [invoices, isCreating]);

  const setMeta = (key) => (val) => setMetaDraft((d) => ({ ...d, [key]: val }));
  const setInv = (patch) => setSelectedInvoice((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleOpenNewInvoice = () => {
    const maxNum = [...invoices, ...proposals].reduce((acc, item) => {
      const raw = item && (item.invoiceNumber || item.proposalNumber);
      const m = typeof raw === "string" && raw.match(/^AFA(?:-P-)?(\d+)$/);
      return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
    }, 100009);
    const nextNum = maxNum + 1;
    const invNumber = `AFA-${nextNum}`;
    const proposalRef = `AFA-P-${nextNum}`;

    const first = clients[0] || {};
    const newInv = {
      id: "inv_" + Date.now(),
      invoiceNumber: invNumber,
      jobRef: proposalRef,
      clientName: first.clientName || "Jonathan Montao",
      businessName: first.businessName || "Montao Quality Bakery",
      email: first.email || "jonathan@montaobakery.com.au",
      address: first.address || "123 Market St, Blacktown NSW",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "Unpaid",
      invoiceType: "tax",
      depositPercent: null,
      fullLineItems: [
        { description: "Site Audit / Gap Assessment Fee (Phase 1)", priceExGst: 595.0, qty: 1 },
      ],
      lineItems: [
        { description: "Site Audit / Gap Assessment Fee (Phase 1)", priceExGst: 595.0, qty: 1 },
      ],
    };

    setSelectedInvoice(newInv);
    setIsCreating(true);
    toast(`New draft ${newInv.invoiceNumber} ready — fill in details, then Save Invoice Record`, "info");
  };

  const handleAddLineFromCatalog = (catalogItem) => {
    setSelectedInvoice((prev) => {
      const deposit = invoiceTypeOf(prev) === "deposit";
      const fullItems = [...fullLineItemsOf(prev, proposals), { description: catalogItem.name, priceExGst: catalogItem.priceExGst, qty: 1 }];
      const depositExGst = itemTotal(fullItems) * 0.5;
      return {
        ...prev,
        fullLineItems: fullItems,
        lineItems: deposit ? [{ description: `50% Deposit — ${prev.proposalReference || prev.jobRef || "approved engagement"} (${prev.businessName || "Compliance Program"})`, priceExGst: depositExGst, qty: 1 }] : fullItems,
        depositExGst: deposit ? depositExGst : null,
      };
    });
  };

  const handleUpdateLine = (idx, patch) => {
    setSelectedInvoice((prev) => {
      const deposit = invoiceTypeOf(prev) === "deposit";
      const sourceItems = deposit ? fullLineItemsOf(prev, proposals) : lineItemsOf(prev);
      const items = sourceItems.map((it, i) => (i === idx ? { ...it, ...patch } : it));
      if (!deposit) return { ...prev, lineItems: items, fullLineItems: items };
      const depositExGst = itemTotal(items) * 0.5;
      return {
        ...prev,
        fullLineItems: items,
        depositExGst,
        lineItems: [{ description: `50% Deposit — ${prev.proposalReference || prev.jobRef || "approved engagement"} (${prev.businessName || "Compliance Program"})`, priceExGst: depositExGst, qty: 1 }],
      };
    });
  };

  const handleRemoveLineItem = (idx) => {
    setSelectedInvoice((prev) => {
      const deposit = invoiceTypeOf(prev) === "deposit";
      const sourceItems = deposit ? fullLineItemsOf(prev, proposals) : lineItemsOf(prev);
      const items = sourceItems.filter((_, i) => i !== idx);
      if (!deposit) return { ...prev, lineItems: items, fullLineItems: items };
      const depositExGst = itemTotal(items) * 0.5;
      return {
        ...prev,
        fullLineItems: items,
        depositExGst,
        lineItems: [{ description: `50% Deposit — ${prev.proposalReference || prev.jobRef || "approved engagement"} (${prev.businessName || "Compliance Program"})`, priceExGst: depositExGst, qty: 1 }],
      };
    });
  };

  const handleInvoiceTypeChange = (nextType) => {
    if (!selectedInvoice) return;
    const fullItems = fullLineItemsOf(selectedInvoice, proposals);
    const isDeposit = nextType === "deposit";
    const fullSubtotal = itemTotal(fullItems);
    const depositAmount = fullSubtotal * 0.5;
    const reference = selectedInvoice.proposalReference || selectedInvoice.jobRef || "approved engagement";
    const depositItems = [{
      description: `50% Deposit — ${reference} (${selectedInvoice.businessName || "Compliance Program"})`,
      priceExGst: depositAmount,
      qty: 1,
    }];

    setInv({
      invoiceType: nextType,
      depositPercent: isDeposit ? 50 : null,
      depositExGst: isDeposit ? depositAmount : null,
      fullLineItems: fullItems,
      lineItems: isDeposit ? depositItems : fullItems,
    });
  };

  const handleSaveInvoice = () => {
    if (!selectedInvoice) return;
    const invoiceType = invoiceTypeOf(selectedInvoice);
    const fullItems = fullLineItemsOf(selectedInvoice, proposals);
    const currentSubtotal = itemTotal(lineItemsOf(selectedInvoice));
    const metaChanged = ["businessName", "abn", "tagline", "website", "phone", "email", "signature", "bankName", "bankBsb", "bankAcct", "bankAcctName", "stripeLink", "stripeFeePct"].some(
      (k) => metaDraft[k] !== (settings && settings[k])
    );
    if (metaChanged && onUpdateSettings) onUpdateSettings(metaDraft);
    const clean = {
      ...selectedInvoice,
      invoiceType,
      depositPercent: invoiceType === "deposit" ? 50 : null,
      depositExGst: invoiceType === "deposit" ? currentSubtotal : null,
      fullLineItems: fullItems,
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

  const isDepositInvoice = invoiceTypeOf(selectedInvoice) === "deposit";
  const subtotalExGst = selectedInvoice ? itemTotal(lineItemsOf(selectedInvoice)) : 0;
  const gstAmount = subtotalExGst * 0.1;
  const totalInclGst = subtotalExGst + gstAmount;
  const fullSubtotalExGst = selectedInvoice ? itemTotal(fullLineItemsOf(selectedInvoice, proposals)) : 0;
  const fullGstAmount = fullSubtotalExGst * 0.1;
  const fullTotalInclGst = fullSubtotalExGst + fullGstAmount;
  const depositTotalInclGst = fullTotalInclGst * 0.5;
  const amountDueInclGst = isDepositInvoice ? depositTotalInclGst : totalInclGst;
  const balanceInclGst = Math.max(0, fullTotalInclGst - amountDueInclGst);
  const stripeFee = amountDueInclGst * (Number(metaDraft.stripeFeePct) || 0) / 100;
  const stripeCharged = amountDueInclGst + stripeFee;
  const documentTitle = isDepositInvoice ? "DEPOSIT TAX INVOICE" : "TAX INVOICE";
  const displayPaymentTerms = isDepositInvoice ? "50% deposit due now" : (selectedInvoice?.paymentTermsLabel || "14 days");
  const displayedLineItems = isDepositInvoice ? fullLineItemsOf(selectedInvoice, proposals) : lineItemsOf(selectedInvoice);
  const termsText = selectedInvoice?.terms || metaDraft.invoiceTerms || TERMS_FALLBACK;
  const termBlocks = termsText.split(/\n+/).map((term) => term.trim()).filter(Boolean);
  const defaultScopeText = "This engagement will bring the client’s food safety documentation up to date ahead of NSW Food Authority or Council review and establish a robust compliance foundation for the planned operation. The key activities are:\n• Update and strengthen the HACCP plan to reflect current products, processes and hazards.\n• Bring product labelling into compliance, including ingredient, allergen and storage information.\n• Complete the agreed food safety program and readiness review.";

  return (
    <div className="invoice-page" style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Action Bar */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            Invoice Generator
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
                  {invoiceTypeOf(inv) === "deposit" && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "#e8f3ec", color: "#17643a", letterSpacing: "0.04em" }}>
                      DEPOSIT 50%
                    </span>
                  )}
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
                  {invoiceTypeOf(inv) === "deposit" ? "Deposit total" : "Total"}: <strong>${fmtMoney(tot)} incl GST</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Branded Invoice Document */}
        {selectedInvoice ? (
          <div>
            <div className="no-print" style={{ marginBottom: 14, padding: "14px 16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "#ffffff", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Invoice type</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 3 }}>Choose what this draft should show when printed or saved.</div>
                </div>
                <div role="group" aria-label="Invoice type" style={{ display: "inline-flex", padding: 4, borderRadius: 10, background: "#eef2f4", gap: 4 }}>
                  {[{ value: "tax", label: "Tax Invoice" }, { value: "deposit", label: "50% Deposit Invoice" }].map((option) => {
                    const active = invoiceTypeOf(selectedInvoice) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleInvoiceTypeChange(option.value)}
                        style={{
                          border: active ? "1px solid var(--navy)" : "1px solid transparent",
                          borderRadius: 7,
                          background: active ? "var(--navy)" : "transparent",
                          color: active ? "#ffffff" : "var(--navy)",
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 160ms ease-out",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
            {/* Document Header Banner — Sydney Automation Co exact style adapted to AMES */}
            <div style={{ background: "var(--navy-deep)", color: "#ffffff", padding: "16px 30px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <AMESLogo variant="light" size="md" />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "var(--amber)", letterSpacing: "0.06em", fontFamily: "Georgia, serif" }}>
                    {documentTitle}
                  </div>
                  <input
                    value={selectedInvoice.invoiceNumber || ""}
                    onChange={(e) => setInv({ invoiceNumber: e.target.value })}
                    title="Invoice number — editable"
                    placeholder="AFA-100010"
                    style={{
                      fontSize: 12, fontWeight: 800, color: "#ffffff", marginTop: 2, textAlign: "right",
                      background: "transparent", border: "none", borderBottom: "1px dashed rgba(255,255,255,0.4)", outline: "none",
                      fontFamily: "var(--font-mono)", width: 150,
                    }}
                  />
                </div>
              </div>

              {/* Sub-header info bar — compact reference contact strip */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", fontSize: 11.5 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 0" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <strong style={{ opacity: 0.7 }}>ABN</strong> {metaInput(metaDraft.abn, setMeta("abn"), { minWidth: 120, font: "var(--font-mono)", light: true })}
                  </span>
                  <span style={{ height: 12, width: 1, background: "rgba(255,255,255,0.3)", margin: "0 16px" }} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <strong style={{ opacity: 0.7 }}>Phone</strong> {metaInput(metaDraft.phone, setMeta("phone"), { minWidth: 110, light: true })}
                  </span>
                  <span style={{ height: 12, width: 1, background: "rgba(255,255,255,0.3)", margin: "0 16px" }} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <strong style={{ opacity: 0.7 }}>Email</strong> {metaInput(metaDraft.email, setMeta("email"), { minWidth: 170, light: true })}
                  </span>
                  <span style={{ height: 12, width: 1, background: "rgba(255,255,255,0.3)", margin: "0 16px" }} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>{metaInput(metaDraft.website, setMeta("website"), { minWidth: 150, light: true })}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: "28px 36px" }}>
              {/* BILL TO & DETAILS Split Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, marginBottom: 24, borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
                {/* Left: Bill To */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--amber-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    BILL TO
                  </div>
                  <input
                    value={selectedInvoice.businessName || ""}
                    onChange={(e) => setInv({ businessName: e.target.value })}
                    placeholder="Business / Client Name"
                    style={{ fontSize: 17, fontWeight: 800, color: "var(--navy)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%" }}
                  />
                  <div style={{ marginTop: 4 }}>
                    <input
                      value={selectedInvoice.clientName || ""}
                      onChange={(e) => setInv({ clientName: e.target.value })}
                      placeholder="Attention Contact Person"
                      style={{ fontSize: 13, color: "var(--text-dark)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%" }}
                    />
                  </div>
                  <input
                    value={selectedInvoice.address || ""}
                    onChange={(e) => setInv({ address: e.target.value })}
                    placeholder="Street Address"
                    style={{ fontSize: 12.5, color: "var(--ink-soft)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%", marginTop: 4 }}
                  />
                  <input
                    value={selectedInvoice.email || ""}
                    onChange={(e) => setInv({ email: e.target.value })}
                    placeholder="Email Address"
                    style={{ fontSize: 12.5, color: "var(--ink-soft)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", width: "100%", marginTop: 2 }}
                  />
                </div>

                {/* Right: Details Key-Value List */}
                <div style={{ borderLeft: "1px solid var(--border-light)", paddingLeft: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    DETAILS
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", rowGap: 8, fontSize: 13 }}>
                    <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>Invoice No:</span>
                    <input
                      className="mono"
                      value={selectedInvoice.invoiceNumber || ""}
                      onChange={(e) => setInv({ invoiceNumber: e.target.value })}
                      style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none" }}
                    />

                    <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>Job Ref:</span>
                    <input
                      className="mono"
                      value={selectedInvoice.jobRef || "AFA-P-100010"}
                      onChange={(e) => setInv({ jobRef: e.target.value })}
                      style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none" }}
                    />

                    <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>Invoice Type:</span>
                    <strong style={{ color: isDepositInvoice ? "#17643a" : "var(--navy)" }}>{isDepositInvoice ? "50% Deposit Invoice" : "Tax Invoice"}</strong>

                    {isDepositInvoice && (
                      <>
                        <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>Job No:</span>
                        <strong className="mono" style={{ color: "var(--navy)" }}>{selectedInvoice.jobNumber || selectedInvoice.jobRef || "—"}</strong>
                      </>
                    )}

                    <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>Issue Date:</span>
                    <input
                      type="date"
                      value={selectedInvoice.issueDate || ""}
                      onChange={(e) => setInv({ issueDate: e.target.value })}
                      style={{ fontSize: 12.5, border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none" }}
                    />

                    <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>Payment Terms:</span>
                    {isDepositInvoice ? (
                      <strong style={{ color: "#17643a" }}>{displayPaymentTerms}</strong>
                    ) : (
                      <select
                        value={selectedInvoice.paymentTermsLabel || "due on invoice"}
                        onChange={(e) => {
                          const label = e.target.value;
                          const days = label === "due on invoice" ? 0 : parseInt(label, 10);
                          let due = selectedInvoice.issueDate;
                          if (due) {
                            const d = new Date(due + "T00:00:00");
                            d.setDate(d.getDate() + (isNaN(days) ? 0 : days));
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, "0");
                            const dd = String(d.getDate()).padStart(2, "0");
                            due = `${y}-${m}-${dd}`;
                          }
                          setInv({ paymentTermsLabel: label, dueDate: due });
                        }}
                        style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", border: "none", borderBottom: "1px dashed var(--border-color)", background: "transparent", outline: "none", padding: "2px 0" }}
                      >
                        <option value="due on invoice">Due on invoice</option>
                        <option value="7 days">7 days</option>
                        <option value="14 days">14 days</option>
                        <option value="30 days">30 days</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* SCOPE OF WORK Section */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  SCOPE OF WORK
                </div>
                <textarea
                  value={selectedInvoice.scopeText || defaultScopeText}
                  onChange={(e) => setInv({ scopeText: e.target.value })}
                  rows={4}
                  style={{
                    width: "100%", fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6,
                    border: "none", background: "#fcfbf7", borderRadius: 6, padding: "10px 12px", borderLeft: "3px solid var(--navy)",
                    outline: "none", fontFamily: "inherit", resize: "vertical",
                  }}
                />
              </div>

              {/* Quick Catalog Adder */}
              <div className="no-print" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  + Add Catalog Item:
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

              {/* Line Items Table — Sydney Automation Co exact table style */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left", marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: "var(--navy)", color: "#ffffff" }}>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>DESCRIPTION</th>
                    <th style={{ padding: "10px 12px", width: 60, textAlign: "center", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>QTY</th>
                    <th style={{ padding: "10px 12px", width: 140, textAlign: "right", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>UNIT ($)</th>
                    <th style={{ padding: "10px 12px", width: 140, textAlign: "right", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>AMOUNT ($)</th>
                    <th style={{ padding: "10px 12px", width: 30 }} className="no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLineItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "12px" }}>
                        <textarea
                          rows={2}
                          value={item.description || ""}
                          onChange={(e) => handleUpdateLine(idx, { description: e.target.value })}
                          style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, color: "var(--text-dark)", fontWeight: 700, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", verticalAlign: "top" }}>
                        <input
                          type="number"
                          min="1"
                          value={Number(item.qty) || 1}
                          onChange={(e) => handleUpdateLine(idx, { qty: parseInt(e.target.value, 10) || 1 })}
                          style={{ width: 44, border: "none", borderBottom: "1px dashed var(--border-color)", textAlign: "center", fontSize: 13, background: "transparent" }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", verticalAlign: "top" }}>
                        $<input
                          type="number"
                          step="0.01"
                          value={Number(item.priceExGst) || 0}
                          onChange={(e) => handleUpdateLine(idx, { priceExGst: parseFloat(e.target.value) || 0 })}
                          style={{ width: 85, border: "none", borderBottom: "1px dashed var(--border-color)", textAlign: "right", fontSize: 13, background: "transparent" }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: 800, fontSize: 14, verticalAlign: "top", color: "var(--navy)" }}>
                        ${fmtMoney((Number(item.priceExGst) || 0) * (Number(item.qty) || 1))}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", verticalAlign: "top" }} className="no-print">
                        <button onClick={() => handleRemoveLineItem(idx)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* REFERENCE-MATCHED TOTALS */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, marginBottom: 18 }}>
                <div style={{ width: 380, fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: "var(--ink-soft)" }}>
                    <span>{isDepositInvoice ? "Full engagement subtotal (ex GST)" : "Subtotal (ex GST)"}</span>
                    <span>${fmtMoney(fullSubtotalExGst)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: "var(--ink-soft)" }}>
                    <span>GST (10%)</span>
                    <span>${fmtMoney(fullGstAmount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "1px solid var(--border-color)", fontWeight: 800, color: "var(--navy)" }}>
                    <span>{isDepositInvoice ? "Full project total (inc GST)" : "Total due (inc GST)"}</span>
                    <span>${fmtMoney(fullTotalInclGst)}</span>
                  </div>
                  {isDepositInvoice && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontWeight: 900, color: "var(--navy)" }}>
                        <span>This deposit invoice — 50%</span>
                        <span>${fmtMoney(depositTotalInclGst)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "var(--ink-soft)" }}>
                        <span>Balance on final documentation</span>
                        <span>${fmtMoney(balanceInclGst)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* BANK TRANSFER + OUTSTANDING NOW */}
              <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, background: "#f4f7f5", padding: "12px 16px", marginTop: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>BANK TRANSFER</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 22px", fontSize: 11.5, color: "#334155" }}>
                  <div><span style={{ color: "var(--ink-soft)" }}><strong>ACCOUNT:</strong> </span>{metaInput(metaDraft.bankAcctName, setMeta("bankAcctName"), { width: 180, bold: true, size: 11.5 })}</div>
                  <div><span style={{ color: "var(--ink-soft)" }}><strong>BSB:</strong> </span>{metaInput(metaDraft.bankBsb, setMeta("bankBsb"), { width: 88, font: "var(--font-mono)", size: 11.5 })}</div>
                  <div><span style={{ color: "var(--ink-soft)" }}><strong>ACCT NO:</strong> </span>{metaInput(metaDraft.bankAcct, setMeta("bankAcct"), { width: 100, font: "var(--font-mono)", size: 11.5 })}</div>
                  <div><span style={{ color: "var(--ink-soft)" }}><strong>REFERENCE:</strong> </span><strong style={{ color: "var(--amber-dim)" }}>{selectedInvoice.invoiceNumber}</strong></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#e8f0ed", borderRadius: 7, marginTop: 10, padding: "9px 14px", color: "var(--navy)", fontSize: 12, fontWeight: 900, letterSpacing: "0.04em" }}>
                <span>{isDepositInvoice ? "OUTSTANDING OWED NOW" : "TOTAL OWED NOW"}</span>
                <span style={{ fontSize: 19, fontFamily: "var(--font-mono)" }}>${fmtMoney(amountDueInclGst)}</span>
              </div>

              {/* CARD PAYMENT — interactive only; hidden in printed reference output */}
              <div className="no-print" style={{ border: "1.5px solid #635bff", borderRadius: 10, padding: 16, background: "#ffffff", marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#635bff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Card Payment — Stripe</div>
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.9 }}>
                  <div><span style={{ color: "var(--ink-soft)" }}><strong>Payment link:</strong> </span>{metaInput(metaDraft.stripeLink, setMeta("stripeLink"), { width: 240, size: 12.5 })}</div>
                  <div style={{ marginTop: 6, padding: "10px 12px", background: "#f6f7f9", borderRadius: 8, fontSize: 12.5, lineHeight: 1.8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-soft)" }}>{isDepositInvoice ? "Deposit invoice total" : "Invoice total"}</span><span style={{ fontWeight: 700, color: "var(--navy)" }}>${fmtMoney(amountDueInclGst)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: "var(--ink-soft)" }}>Stripe fee ({metaInput(metaDraft.stripeFeePct, setMeta("stripeFeePct"), { width: 34, size: 12.5 })}%)</span><span style={{ fontWeight: 700, color: "var(--danger)" }}>+${fmtMoney(stripeFee)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: 6, marginTop: 6 }}><span style={{ color: "var(--ink)" }}><strong>Amount to pay by card</strong></span><span style={{ fontWeight: 900, fontSize: 16, color: "#635bff" }}>${fmtMoney(stripeCharged)}</span></div>
                  </div>
                </div>
              </div>

              {/* REFERENCE-MATCHED TERMS PAGE */}
              <div className="invoice-terms-page" style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
                <div style={{ background: "var(--navy-deep)", color: "#ffffff", borderRadius: 6, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 900 }}>Terms &amp; Conditions</span>
                  <span style={{ fontSize: 10.5, color: "var(--amber)", fontWeight: 800 }}>{documentTitle} {selectedInvoice.invoiceNumber}</span>
                </div>
                <p style={{ margin: "16px 0 10px", color: "var(--ink-soft)", fontSize: 11.5 }}>These terms apply to the engagement described in this invoice.</p>
                <div className="invoice-terms-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px", color: "var(--ink-soft)", fontSize: 11.5, lineHeight: 1.55 }}>
                  {termBlocks.map((term, index) => {
                    const match = term.match(/^(\d+\.?)\s*(.*?)(?:\s*[—-]\s+)(.*)$/);
                    const number = match ? match[1] : `${index + 1}.`;
                    const heading = match ? match[2].trim() : "";
                    const body = match ? match[3].trim() : term;
                    return (
                      <div key={`${number}-${heading}`}>
                        <strong style={{ color: "var(--navy)" }}>{number} {heading}</strong>{heading ? " " : ""}{body}
                      </div>
                    );
                  })}
                </div>
                <textarea
                  className="no-print"
                  aria-label="Invoice terms and conditions editor"
                  value={termsText}
                  onChange={(e) => setInv({ terms: e.target.value })}
                  rows={4}
                  style={{ width: "100%", marginTop: 18, fontSize: 11.5, color: "var(--ink-soft)", lineHeight: 1.5, border: "1px dashed var(--border-color)", background: "#faf9f5", outline: "none", resize: "vertical", fontFamily: "inherit", padding: 8 }}
                />
                <div style={{ borderTop: "1px solid var(--border-color)", marginTop: 20, paddingTop: 10, color: "var(--ink-soft)", fontSize: 11.5 }}>
                  <strong style={{ color: "var(--navy)" }}>Thank you for choosing AMES Food Advisory.</strong><br />
                  {metaDraft.website} · {metaDraft.email} · {metaDraft.phone}
                </div>
              </div>

              {/* Save / Status Controls */}
              <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", marginTop: 24 }}>
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
