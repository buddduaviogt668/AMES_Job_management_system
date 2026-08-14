export const lineItemsOf = (inv) => (Array.isArray(inv && inv.lineItems) ? inv.lineItems : []);

export const invoiceTypeOf = (inv) => {
  if (!inv) return "tax";
  return inv.invoiceType === "deposit" || inv.depositPercent === 50 || lineItemsOf(inv).some((item) => /50%\s*deposit/i.test(item.description || ""))
    ? "deposit"
    : "tax";
};

export const itemTotal = (items) => items.reduce((acc, item) => acc + (Number(item.priceExGst) || 0) * (Number(item.qty) || 1), 0);

export const fullLineItemsOf = (inv) => {
  if (!inv) return [];
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
