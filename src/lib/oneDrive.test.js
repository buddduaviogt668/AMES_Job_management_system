import test from "node:test";
import assert from "node:assert/strict";
import { buildOneDriveFolderModel } from "./oneDrive.js";

test("builds the approved OneDrive folder model for a proposal and invoice", () => {
  const model = buildOneDriveFolderModel({
    businessName: "Manning Support Services",
    proposalNumber: "AFA-P-100011",
    invoiceNumber: "AFA-100011",
  });

  assert.deepEqual(model.proposalPath, ["Ames Food Advisory", "Manning Support Services", "AFA-P-100011", "Proposal"]);
  assert.deepEqual(model.invoicePath, ["Ames Food Advisory", "Manning Support Services", "AFA-100011", "Invoices"]);
  assert.deepEqual(model.jobPath, ["Ames Food Advisory", "Manning Support Services", "AFA-100011", "Job Documents"]);
});

test("uses the proposal number for the invoice/job folder when no invoice exists yet", () => {
  const model = buildOneDriveFolderModel({ businessName: "Chew Boy", proposalNumber: "AFA-P-100010" });
  assert.deepEqual(model.invoicePath, ["Ames Food Advisory", "Chew Boy", "AFA-100010", "Invoices"]);
  assert.deepEqual(model.jobPath, ["Ames Food Advisory", "Chew Boy", "AFA-100010", "Job Documents"]);
});

test("sanitizes OneDrive folder names without changing the proposal sequence", () => {
  const model = buildOneDriveFolderModel({ businessName: "A/B: Test?", proposalNumber: "AFA-P-100012", invoiceNumber: "AFA-100012" });
  assert.equal(model.client, "A-B- Test-");
  assert.equal(model.proposal, "AFA-P-100012");
});
