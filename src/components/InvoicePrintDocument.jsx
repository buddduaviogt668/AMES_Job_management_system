import AMESLogo from "./common/AMESLogo";

const fmtMoney = (value) => (Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "0.00");

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

const DEFAULT_SCOPE = "This engagement will bring the client’s food safety documentation up to date ahead of NSW Food Authority or Council review and establish a robust compliance foundation for the planned operation. The key activities are:\n• Update and strengthen the HACCP plan to reflect current products, processes and hazards.\n• Bring product labelling into compliance, including ingredient, allergen and storage information.\n• Complete the agreed food safety program and readiness review.";

export default function InvoicePrintDocument({
  invoice,
  meta,
  isDeposit,
  title,
  lineItems,
  fullSubtotalExGst,
  fullGstAmount,
  fullTotalInclGst,
  depositTotalInclGst,
  amountDueInclGst,
  balanceInclGst,
  terms,
}) {
  if (!invoice) return null;

  const scopeText = invoice.scopeText || DEFAULT_SCOPE;
  const termBlocks = String(terms || "")
    .split(/\n+/)
    .map((term) => term.trim())
    .filter(Boolean);

  return (
    <div className="invoice-print-only" aria-hidden="true">
      <section className="print-sheet print-sheet-page-one">
        <header className="print-header">
          <AMESLogo variant="light" size="sm" />
          <div className="print-header-title">
            <div>{title}</div>
            <strong>{invoice.invoiceNumber || "—"}</strong>
          </div>
          <div className="print-contact-strip">
            <span><b>ABN</b> {meta.abn || "—"}</span>
            <span><b>Phone</b> {meta.phone || "—"}</span>
            <span><b>Email</b> {meta.email || "—"}</span>
            <span>{meta.website || "amesfoodadvisory.com.au"}</span>
          </div>
        </header>

        <div className="print-client-grid">
          <div>
            <div className="print-label">Bill to</div>
            <strong className="print-client-name">{invoice.businessName || "—"}</strong>
            <div>{invoice.clientName || "—"}</div>
            <div>{invoice.address || "—"}</div>
            <div>{invoice.email || "—"}</div>
          </div>
          <div>
            <div className="print-label">Invoice details</div>
            <dl className="print-details">
              <dt>Invoice No.</dt><dd>{invoice.invoiceNumber || "—"}</dd>
              <dt>Job Ref.</dt><dd>{invoice.jobRef || "—"}</dd>
              <dt>Issue Date</dt><dd>{formatDate(invoice.issueDate)}</dd>
              <dt>Payment Terms</dt><dd>{isDeposit ? "50% deposit due now" : (invoice.paymentTermsLabel || "Due on invoice")}</dd>
            </dl>
          </div>
        </div>

        <section className="print-scope">
          <div className="print-label">Scope of work</div>
          {scopeText.split(/\n+/).map((line, index) => (
            <div key={`${index}-${line}`} className={line.trim().startsWith("•") || line.trim().startsWith("-") ? "print-scope-bullet" : "print-scope-intro"}>{line}</div>
          ))}
        </section>

        <table className="print-items-table">
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit ($)</th><th>Amount ($)</th></tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => {
              const qty = Number(item.qty) || 1;
              const unit = Number(item.priceExGst) || 0;
              return <tr key={`${item.description || "item"}-${index}`}><td>{item.description || "Service"}</td><td>{qty}</td><td>{fmtMoney(unit)}</td><td>{fmtMoney(unit * qty)}</td></tr>;
            })}
          </tbody>
        </table>

        <div className="print-totals">
          <div><span>{isDeposit ? "Full engagement subtotal (ex GST)" : "Subtotal (ex GST)"}</span><strong>${fmtMoney(fullSubtotalExGst)}</strong></div>
          <div><span>GST (10%)</span><strong>${fmtMoney(fullGstAmount)}</strong></div>
          <div className="print-total-row"><span>{isDeposit ? "Full project total (inc GST)" : "Total due (inc GST)"}</span><strong>${fmtMoney(fullTotalInclGst)}</strong></div>
          {isDeposit && <>
            <div className="print-deposit-row"><span>This deposit invoice — 50%</span><strong>${fmtMoney(depositTotalInclGst)}</strong></div>
            <div><span>Balance on final documentation</span><strong>${fmtMoney(balanceInclGst)}</strong></div>
          </>}
        </div>

        <div className="print-bank-panel">
          <div className="print-label">Bank transfer</div>
          <div className="print-bank-grid">
            <div><b>ACCOUNT</b><span>{meta.bankAcctName || meta.businessName || "—"}</span></div>
            <div><b>BSB</b><span>{meta.bankBsb || "—"}</span></div>
            <div><b>ACCT NO.</b><span>{meta.bankAcct || "—"}</span></div>
            <div><b>REFERENCE</b><span className="print-reference">{invoice.invoiceNumber || "—"}</span></div>
          </div>
        </div>
        <div className="print-outstanding"><span>{isDeposit ? "OUTSTANDING OWED NOW" : "TOTAL OWED NOW"}</span><strong>${fmtMoney(amountDueInclGst)}</strong></div>
      </section>

      <section className="print-sheet print-sheet-page-two">
        <header className="print-terms-header"><strong>Terms &amp; Conditions</strong><span>{title} {invoice.invoiceNumber || "—"}</span></header>
        <p className="print-terms-intro">These terms apply to the engagement described in this invoice.</p>
        <div className="print-terms-grid">
          {termBlocks.map((term, index) => {
            const match = term.match(/^(\d+\.?)\s*(.*?)(?:\s*[—-]\s+)(.*)$/);
            const number = match ? match[1] : `${index + 1}.`;
            const heading = match ? match[2].trim() : "";
            const body = match ? match[3].trim() : term;
            return <div key={`${number}-${heading}`}><b>{number} {heading}</b>{heading ? " " : ""}{body}</div>;
          })}
        </div>
        <footer className="print-footer"><b>Thank you for choosing AMES Food Advisory.</b><br />{meta.website || "amesfoodadvisory.com.au"} · {meta.email || "—"} · {meta.phone || "—"}</footer>
      </section>
    </div>
  );
}
