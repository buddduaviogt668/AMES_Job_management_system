import test from "node:test";
import assert from "node:assert/strict";
import { isChewBoyProposal, isManningProposal, migrateManningProposalNumber, normalizeProposalNumber } from "./proposalNumbering.js";

test("normalizes numeric legacy proposal suffixes", () => {
  assert.equal(normalizeProposalNumber("10"), "AFA-P-100010");
  assert.equal(normalizeProposalNumber("AFA-P-100010"), "AFA-P-100010");
});

test("identifies Chew Boy and Manning proposal names", () => {
  assert.equal(isChewBoyProposal({ businessName: "Chew Boy" }), true);
  assert.equal(isManningProposal({ businessName: "MSS Manning Support Services" }), true);
});

test("migrates Manning to AFA-P-100011 and updates linked records", () => {
  const result = migrateManningProposalNumber({
    proposals: [{ id: "p-manning", proposalNumber: "AFA-P-100010", businessName: "MSS Manning Support Services", launchedJobId: "j-manning" }],
    jobs: [{ id: "j-manning", jobNumber: "AFA-P-100010" }],
    invoices: [{ id: "i-manning", proposalId: "p-manning", jobRef: "AFA-P-100010", proposalReference: "AFA-P-100010", lineItems: [{ description: "50% Deposit — AFA-P-100010 (MSS Manning Support Services)" }] }],
  });
  assert.equal(result.changed, true);
  assert.equal(result.proposals[0].proposalNumber, "AFA-P-100011");
  assert.equal(result.jobs[0].jobNumber, "AFA-P-100011");
  assert.equal(result.invoices[0].jobRef, "AFA-P-100011");
  assert.match(result.invoices[0].lineItems[0].description, /AFA-P-100011/);
});

test("blocks a Manning migration when AFA-P-100011 is already assigned", () => {
  const result = migrateManningProposalNumber({
    proposals: [
      { id: "p-manning", proposalNumber: "AFA-P-100010", businessName: "MSS Manning Support Services" },
      { id: "p-other", proposalNumber: "AFA-P-100011", businessName: "Other Food Business" },
    ],
    jobs: [],
    invoices: [],
  });
  assert.equal(result.blocked, true);
  assert.equal(result.changed, false);
});
