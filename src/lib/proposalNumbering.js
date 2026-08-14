const digitsFrom = (value) => {
  const match = String(value || "").match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

export const normalizeProposalNumber = (value) => {
  const number = digitsFrom(value);
  if (!number) return null;
  const sequence = number < 100000 ? 100000 + number : number;
  return `AFA-P-${String(sequence).padStart(6, "0")}`;
};

const normalizedName = (proposal) => String(proposal?.businessName || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const isManningProposal = (proposal) => {
  const name = normalizedName(proposal);
  return name.includes("manning") || (name.includes("mss") && name.includes("support"));
};

export const isChewBoyProposal = (proposal) => normalizedName(proposal).includes("chew boy") || normalizedName(proposal).includes("chewboy");

export const updateLinkedReferences = ({ proposals, jobs, invoices }, proposalId, oldNumber, nextNumber, linkedJobId = null) => {
  const nextProposals = proposals.map((proposal) => (proposal.id === proposalId ? { ...proposal, proposalNumber: nextNumber } : proposal));
  const nextJobs = jobs.map((job) => {
    const linked = job.id === linkedJobId || job.proposalId === proposalId || job.jobNumber === oldNumber || job.proposalNumber === oldNumber;
    return linked ? { ...job, jobNumber: nextNumber, proposalNumber: nextNumber } : job;
  });
  const nextInvoices = invoices.map((invoice) => {
    const linked = invoice.proposalId === proposalId || invoice.jobRef === oldNumber || invoice.proposalReference === oldNumber;
    if (!linked) return invoice;
    const replaceRef = (value) => typeof value === "string" ? value.replaceAll(oldNumber, nextNumber) : value;
    return {
      ...invoice,
      jobRef: nextNumber,
      proposalReference: nextNumber,
      lineItems: Array.isArray(invoice.lineItems) ? invoice.lineItems.map((item) => ({ ...item, description: replaceRef(item.description) })) : invoice.lineItems,
    };
  });
  return { proposals: nextProposals, jobs: nextJobs, invoices: nextInvoices };
};

export const migrateManningProposalNumber = ({ proposals, jobs, invoices }) => {
  const manning = proposals.find(isManningProposal);
  if (!manning || manning.proposalNumber === "AFA-P-100011") return { changed: false, proposals, jobs, invoices, proposal: manning || null };
  const nextNumber = "AFA-P-100011";
  const collision = proposals.some((proposal) => proposal.id !== manning.id && proposal.proposalNumber === nextNumber) || jobs.some((job) => job.id !== manning.launchedJobId && job.jobNumber === nextNumber);
  if (collision) return { changed: false, blocked: true, reason: `${nextNumber} is already assigned to another record`, proposals, jobs, invoices, proposal: manning };
  return { changed: true, proposal: manning, ...updateLinkedReferences({ proposals, jobs, invoices }, manning.id, manning.proposalNumber, nextNumber, manning.launchedJobId) };
};
