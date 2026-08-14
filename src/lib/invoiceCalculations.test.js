import test from "node:test";
import assert from "node:assert/strict";
import { fullLineItemsOf, invoiceTypeOf, itemTotal } from "./invoiceCalculations.js";

test("defaults a new invoice to a tax invoice", () => {
  const invoice = { lineItems: [{ description: "Food safety program", priceExGst: 1000, qty: 1 }] };
  assert.equal(invoiceTypeOf(invoice), "tax");
  assert.equal(itemTotal(invoice.lineItems), 1000);
});

test("recognises an automatic deposit invoice and restores the full engagement amount", () => {
  const invoice = {
    invoiceType: "deposit",
    depositPercent: 50,
    lineItems: [{ description: "50% Deposit — AFA-P-100011 (MSS Manning Support Services Compliance Program)", priceExGst: 825, qty: 1 }],
  };
  assert.equal(invoiceTypeOf(invoice), "deposit");
  assert.equal(itemTotal(fullLineItemsOf(invoice)), 1650);
});

test("uses proposal phase pricing for the full engagement line-item table", () => {
  const invoice = { invoiceType: "deposit", depositPercent: 50, proposalId: "prop_manning", lineItems: [{ description: "50% Deposit", priceExGst: 3407.25, qty: 1 }] };
  const proposals = [{
    id: "prop_manning",
    proposalNumber: "AFA-P-100011",
    snapshot: {
      includedPhases: { 1: true, 2: true, 3: true, 4: true },
      phasePricesExGst: { 1: 595, 2: 4500, 3: 600, 4: 500 },
      phaseTitles: { 1: "Site Audit / Gap Assessment Fee (Phase 1)", 2: "Compliance package", 3: "NSW Food Authority audit preparation", 4: "Allergen review" },
    },
  }];
  const items = fullLineItemsOf(invoice, proposals);
  assert.deepEqual(items.map((item) => item.description), [
    "Site Audit / Gap Assessment Fee (Phase 1)",
    "Compliance package",
    "NSW Food Authority audit preparation",
    "Allergen review",
  ]);
  assert.equal(itemTotal(items), 6195);
});

test("prefers stored full line items so a manual toggle is reversible", () => {
  const invoice = {
    invoiceType: "deposit",
    lineItems: [{ description: "50% Deposit — approved engagement", priceExGst: 550, qty: 1 }],
    fullLineItems: [
      { description: "Phase 1", priceExGst: 600, qty: 1 },
      { description: "Phase 2", priceExGst: 500, qty: 1 },
    ],
  };
  assert.equal(itemTotal(fullLineItemsOf(invoice)), 1100);
  assert.equal(itemTotal(invoice.lineItems), 550);
});
