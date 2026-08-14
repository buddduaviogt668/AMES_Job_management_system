const DEFAULT_PHASE_NAMES = {
  1: "Site Audit / Gap Assessment Fee (Phase 1)",
  2: "Compliance package",
  3: "NSW Food Authority audit preparation",
  4: "Allergen review",
};

export const lineItemsOf = (inv) => (Array.isArray(inv && inv.lineItems) ? inv.lineItems : []);

export const invoiceTypeOf = (inv) => {
  if (!inv) return "tax";
  return inv.invoiceType === "deposit" || inv.depositPercent === 50 || lineItemsOf(inv).some((item) => /50%\s*deposit/i.test(item.description || ""))
    ? "deposit"
    : "tax";
};

export const itemTotal = (items) => items.reduce((acc, item) => acc + (Number(item.priceExGst) || 0) * (Number(item.qty) || 1), 0);

const proposalForInvoice = (inv, proposals = []) => proposals.find((proposal) => (
  proposal.id === inv.proposalId ||
  proposal.proposalNumber === inv.proposalReference ||
  proposal.proposalNumber === inv.jobRef
));

const proposalLineItems = (proposal) => {
  const snapshot = proposal && proposal.snapshot;
  if (!snapshot || !snapshot.phasePricesExGst) return [];
  const included = snapshot.includedPhases || { 1: true, 2: true, 3: true, 4: true };
  const titles = snapshot.phaseTitles || {};
  return [1, 2, 3, 4]
    .filter((phaseNum) => included[phaseNum])
    .map((phaseNum) => ({
      description: titles[phaseNum] || DEFAULT_PHASE_NAMES[phaseNum],
      priceExGst: Number(snapshot.phasePricesExGst[phaseNum]) || 0,
      qty: 1,
    }));
};

export const fullLineItemsOf = (inv, proposals = []) => {
  if (!inv) return [];

  const proposalItems = proposalLineItems(proposalForInvoice(inv, proposals));
  if (proposalItems.length) return proposalItems;
  if (Array.isArray(inv.fullLineItems) && inv.fullLineItems.length) return inv.fullLineItems;

  const items = lineItemsOf(inv);
  if (invoiceTypeOf(inv) === "deposit") {
    return items.map((item) => ({
      ...item,
      description: String(item.description || "Service").replace(/^50%\s*Deposit\s*[—-]\s*/i, ""),
      priceExGst: (Number(item.priceExGst) || 0) * 2,
    }));
  }
  return items;
};
