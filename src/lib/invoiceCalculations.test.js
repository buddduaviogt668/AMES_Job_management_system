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
