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

const normalizedName = (record) => String(record?.businessName || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const isManningProposal = (record) => {
  const name = normalizedName(record);
  return name.includes("manning") || (name.includes("mss") && name.includes("support"));
};

export const isChewBoyProposal = (record) => normalizedName(record).includes("chew boy") || normalizedName(record).includes("chewboy");

export const updateLinkedReferences = ({ proposals, jobs, invoices }, proposalId, oldNumber, nextNumber, linkedJobId = null) => {
  const oldReferences = [oldNumber, "AFA-P-100010"].filter(Boolean);
  const nextProposals = proposals.map((proposal) => (proposal.id === proposalId ? { ...proposal, proposalNumber: nextNumber } : proposal));
  const nextJobs = jobs.map((job) => {
    const linked = job.id === linkedJobId || job.proposalId === proposalId || job.jobNumber === oldNumber || job.proposalNumber === oldNumber || isManningProposal(job);
    return linked ? { ...job, jobNumber: nextNumber, proposalNumber: nextNumber, proposalId: job.proposalId || proposalId } : job;
  });
  const nextInvoices = invoices.map((invoice) => {
    const linked = invoice.proposalId === proposalId || invoice.jobRef === oldNumber || invoice.proposalReference === oldNumber || isManningProposal(invoice);
    if (!linked) return invoice;
    const replaceRef = (value) => {
      if (typeof value !== "string") return value;
      return oldReferences.reduce((result, reference) => result.replaceAll(reference, nextNumber), value);
    };
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
  if (!manning) return { changed: false, proposals, jobs, invoices, proposal: null };

  const nextNumber = "AFA-P-100011";
  const linkedJob = jobs.find((job) => job.id === manning.launchedJobId || job.proposalId === manning.id || job.jobNumber === manning.proposalNumber || isManningProposal(job));
  const linkedInvoice = invoices.find((invoice) => invoice.proposalId === manning.id || invoice.jobRef === manning.proposalNumber || invoice.proposalReference === manning.proposalNumber || isManningProposal(invoice));
  const hasProposalDrift = manning.proposalNumber !== nextNumber;
  const hasJobDrift = Boolean(linkedJob && (linkedJob.jobNumber !== nextNumber || linkedJob.proposalNumber !== nextNumber || linkedJob.proposalId !== manning.id));
  const hasInvoiceDrift = Boolean(linkedInvoice && (linkedInvoice.jobRef !== nextNumber || linkedInvoice.proposalReference !== nextNumber || (Array.isArray(linkedInvoice.lineItems) && linkedInvoice.lineItems.some((item) => /AFA-P-100010/.test(item.description || "")))));
  if (!hasProposalDrift && !hasJobDrift && !hasInvoiceDrift) return { changed: false, proposals, jobs, invoices, proposal: manning };

  const proposalCollision = proposals.some((proposal) => proposal.id !== manning.id && proposal.proposalNumber === nextNumber);
  const jobCollision = jobs.some((job) => job.id !== linkedJob?.id && job.jobNumber === nextNumber && !isManningProposal(job));
  if (proposalCollision || jobCollision) {
    return { changed: false, blocked: true, reason: `${nextNumber} is already assigned to another record`, proposals, jobs, invoices, proposal: manning };
  }

  return { changed: true, proposal: manning, ...updateLinkedReferences({ proposals, jobs, invoices }, manning.id, manning.proposalNumber, nextNumber, linkedJob?.id || manning.launchedJobId) };
};
