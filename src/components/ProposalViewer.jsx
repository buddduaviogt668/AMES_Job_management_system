import React, { useState, useEffect } from "react";
import { Download, Rocket, Save, FolderOpen, CheckCircle2, FileText } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, LevelFormat, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import AMESLogo from "./common/AMESLogo";
import { toast } from "./common/Toasts";

const DEFAULT_PHASES = {
  1: {
    title: "Gap Assessment (Mock EHO Inspection)",
    priceExGst: 595.0,
    deliverables: "Written gap assessment report against relevant fit-out and hygiene standards",
  },
  2: {
    title: "Food Safety Documentation & Procedures",
    priceExGst: 1500.0,
    deliverables: "Food Safety Program (FSP) & HACCP plan, targeted Standard Operating Procedure (SOP) suite",
  },
  3: {
    title: "Approval Pathway & Regulatory Liaison",
    priceExGst: 450.0,
    deliverables: "Application pathway recommendation & quality-checked submission package",
  },
  4: {
    title: "Final Readiness Review",
    priceExGst: 350.0,
    deliverables: "Final pre-inspection readiness confirmation",
  },
};

const DEFAULTS = {
  includedPhases: { 1: true, 2: true, 3: true, 4: true },
  phasePricesExGst: { 1: 595.0, 2: 1500.0, 3: 450.0, 4: 350.0 },
  phaseTitles: {
    1: DEFAULT_PHASES[1].title,
    2: DEFAULT_PHASES[2].title,
    3: DEFAULT_PHASES[3].title,
    4: DEFAULT_PHASES[4].title,
  },
  phaseDeliverables: {
    1: DEFAULT_PHASES[1].deliverables,
    2: DEFAULT_PHASES[2].deliverables,
    3: DEFAULT_PHASES[3].deliverables,
    4: DEFAULT_PHASES[4].deliverables,
  },
};

const STATUS_TONE = {
  Draft: { bg: "var(--border-light)", color: "var(--ink-mid)" },
  Sent: { bg: "var(--amber-pale)", color: "var(--amber-dim)" },
  Approved: { bg: "var(--success-bg)", color: "var(--success)" },
  Lost: { bg: "var(--danger-bg)", color: "var(--danger)" },
};

export default function ProposalViewer({ proposals, onUpdateProposal, onLaunchJob, onAddLegacyProposal, onUploadDocument, setActiveTab }) {
  const [selectedId, setSelectedId] = useState(proposals[0]?.id || null);
  const [showLegacyEntry, setShowLegacyEntry] = useState(false);
  const [legacyDraft, setLegacyDraft] = useState({
    legacyProposalNumber: "10",
    businessName: "Chew Boy",
    clientName: "",
    email: "",
    address: "",
    status: "Sent",
  });
  const [includedPhases, setIncludedPhases] = useState({ ...DEFAULTS.includedPhases });
  const [phasePricesExGst, setPhasePricesExGst] = useState({ ...DEFAULTS.phasePricesExGst });
  const [phaseTitles, setPhaseTitles] = useState({ ...DEFAULTS.phaseTitles });
  const [phaseDeliverables, setPhaseDeliverables] = useState({ ...DEFAULTS.phaseDeliverables });
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const saved = localStorage.getItem("ames_package_templates");
    return saved ? JSON.parse(saved) : [];
  });
  const [templateName, setTemplateName] = useState("");
  const [activeTemplate, setActiveTemplate] = useState("");

  const selected = proposals.find((p) => p.id === selectedId) || proposals[0] || null;

  useEffect(() => {
    const s = selected && selected.snapshot;
    setIncludedPhases((s && s.includedPhases) || { ...DEFAULTS.includedPhases });
    setPhasePricesExGst((s && s.phasePricesExGst) || { ...DEFAULTS.phasePricesExGst });
    setPhaseTitles((s && s.phaseTitles) || { ...DEFAULTS.phaseTitles });
    setPhaseDeliverables((s && s.phaseDeliverables) || { ...DEFAULTS.phaseDeliverables });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!selected) {
    return (
      <div style={{ padding: "60px 36px", textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 60, boxShadow: "var(--shadow-sm)" }}>
          <FileText size={34} color="var(--amber)" style={{ marginBottom: 12 }} />
          <h2 className="brand-font" style={{ fontSize: 20, color: "var(--navy)" }}>No Proposals Yet</h2>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6 }}>
            Complete a Qualification Questionnaire to generate and preview client proposals.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveTab("questionnaire")} style={{ marginTop: 20 }}>
            <Rocket size={15} /> Start a Qualification
          </button>
        </div>
      </div>
    );
  }

  const { clientName, businessName, industry, lga } = selected;

  const togglePhase = (pNum) => {
    setIncludedPhases((prev) => ({ ...prev, [pNum]: !prev[pNum] }));
  };

  const handlePriceChange = (pNum, val) => {
    setPhasePricesExGst((prev) => ({ ...prev, [pNum]: parseFloat(val) || 0 }));
  };

  const handleTitleChange = (pNum, val) => {
    setPhaseTitles((prev) => ({ ...prev, [pNum]: val }));
  };

  const handleDeliverablesChange = (pNum, val) => {
    setPhaseDeliverables((prev) => ({ ...prev, [pNum]: val }));
  };

  const getActivePhaseNumbers = () => [1, 2, 3, 4].filter((p) => includedPhases[p]);

  const subtotalExGst = getActivePhaseNumbers().reduce((acc, pNum) => acc + (phasePricesExGst[pNum] || 0), 0);
  const gstAmount = subtotalExGst * 0.1;
  const totalInclGst = subtotalExGst + gstAmount;

  const snapshot = () => ({
    includedPhases: { ...includedPhases },
    phasePricesExGst: { ...phasePricesExGst },
    phaseTitles: { ...phaseTitles },
    phaseDeliverables: { ...phaseDeliverables },
  });

  const applyPackageState = (state) => {
    setIncludedPhases(state.includedPhases);
    setPhasePricesExGst(state.phasePricesExGst);
    setPhaseTitles(state.phaseTitles);
    setPhaseDeliverables(state.phaseDeliverables);
  };

  const persistSnapshot = () => {
    onUpdateProposal(selected.id, { snapshot: snapshot() });
    toast("Package saved to proposal", "success");
  };

  const setStatus = (status) => {
    onUpdateProposal(selected.id, { status, snapshot: snapshot() });
    if (status === "Sent") toast("Proposal marked as Sent", "success");
    if (status === "Lost") toast("Proposal marked as Lost", "info");
  };

  const handleLaunch = () => {
    onLaunchJob({ ...selected, snapshot: snapshot(), totalInclGst });
  };

  const handleSaveTemplate = () => {
    const name = templateName.trim();
    if (!name) return;
    const updated = [...savedTemplates.filter((t) => t.name !== name), { name, state: snapshot() }];
    setSavedTemplates(updated);
    localStorage.setItem("ames_package_templates", JSON.stringify(updated));
    setActiveTemplate(name);
    setTemplateName("");
  };

  const handleLoadTemplate = (name) => {
    const tpl = savedTemplates.find((t) => t.name === name);
    if (tpl) {
      applyPackageState(tpl.state);
      setActiveTemplate(name);
    }
  };

  const handleDeleteTemplate = (name) => {
    const updated = savedTemplates.filter((t) => t.name !== name);
    setSavedTemplates(updated);
    localStorage.setItem("ames_package_templates", JSON.stringify(updated));
    if (activeTemplate === name) setActiveTemplate("");
  };

  const updateLegacyDraft = (key) => (event) => setLegacyDraft((draft) => ({ ...draft, [key]: event.target.value }));

  const handleLegacySubmit = () => {
    if (!legacyDraft.legacyProposalNumber.trim() || !legacyDraft.businessName.trim()) {
      toast("Enter the historical proposal number and business name first", "error");
      return;
    }
    const created = onAddLegacyProposal({
      ...legacyDraft,
      clientName: legacyDraft.clientName || "Historical client",
      legacyProposalNumber: legacyDraft.legacyProposalNumber,
      isLegacyProposal: true,
    });
    if (created) {
      setSelectedId(created.id);
      setShowLegacyEntry(false);
      setLegacyDraft({ legacyProposalNumber: "", businessName: "", clientName: "", email: "", address: "", status: "Sent" });
    }
  };

  const handleResetToDefaults = () => {
    setIncludedPhases({ 1: true, 2: true, 3: true, 4: true });
    setPhasePricesExGst({
      1: DEFAULT_PHASES[1].priceExGst,
      2: DEFAULT_PHASES[2].priceExGst,
      3: DEFAULT_PHASES[3].priceExGst,
      4: DEFAULT_PHASES[4].priceExGst,
    });
    setPhaseTitles({
      1: DEFAULT_PHASES[1].title,
      2: DEFAULT_PHASES[2].title,
      3: DEFAULT_PHASES[3].title,
      4: DEFAULT_PHASES[4].title,
    });
    setPhaseDeliverables({
      1: DEFAULT_PHASES[1].deliverables,
      2: DEFAULT_PHASES[2].deliverables,
      3: DEFAULT_PHASES[3].deliverables,
      4: DEFAULT_PHASES[4].deliverables,
    });
    setActiveTemplate("");
  };

  const activePhaseNumbers = getActivePhaseNumbers();

  const exportDocx = async () => {
    const NAVY = "1C2B3A";
    const AMBER = "D4751F";
    const today = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

    const fmt = (n) => "$" + n.toFixed(2);

    const scopeParagraphs = activePhaseNumbers.flatMap((pNum) => [
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 160, after: 80 }, children: [new TextRun({ text: `Phase ${pNum} — ${phaseTitles[pNum]}`, bold: true, color: NAVY })] }),
      ...phaseDeliverables[pNum]
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: d, size: 21 })] })),
    ]);

    const feeRows = activePhaseNumbers.map((pNum) => {
      const cells = [String(pNum), phaseTitles[pNum], fmt(phasePricesExGst[pNum]), fmt(phasePricesExGst[pNum] * 1.1)];
      return new TableRow({ children: cells.map((t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, size: 20 })] })] })) });
    });
    feeRows.push(
      new TableRow({
        children: [
          new TableCell({ shading: { fill: "FEF3E8" }, children: [new Paragraph({ children: [new TextRun({ text: "Program Total", bold: true, size: 20 })] })] }),
          new TableCell({ shading: { fill: "FEF3E8" }, children: [new Paragraph({ children: [new TextRun({ text: "Package (ex. GST + 10% GST)", size: 20 })] })] }),
          new TableCell({ shading: { fill: "FEF3E8" }, children: [new Paragraph({ children: [new TextRun({ text: fmt(subtotalExGst), bold: true, size: 20 })] })] }),
          new TableCell({ shading: { fill: "FEF3E8" }, children: [new Paragraph({ children: [new TextRun({ text: fmt(totalInclGst), bold: true, size: 20 })] })] }),
        ],
      })
    );

    const timelineRows = activePhaseNumbers.map((pNum) => [
      String(pNum),
      phaseTitles[pNum],
      pNum === 1 ? "5–7 business days" : "TBA",
    ]);

    const doc = new Document({
      numbering: {
        config: [{ reference: "scope-bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }],
      },
      sections: [
        {
          properties: { page: { size: { width: 11906, height: 16838 } } },
          children: [
            new Paragraph({ children: [new TextRun({ text: "AMES ", bold: true, size: 32, color: NAVY }), new TextRun({ text: "Food Advisory", bold: true, size: 32, color: AMBER, italics: true })] }),
            new Paragraph({ spacing: { after: 8 }, children: [new TextRun({ text: "Confidential Proposal", size: 18, color: AMBER, italics: true })] }),
            new Paragraph({ border: { bottom: { color: NAVY, space: 4, style: BorderStyle.SINGLE, size: 8 } }, spacing: { after: 300 }, children: [] }),

            new Paragraph({ heading: HeadingLevel.TITLE, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Food Business Compliance & Council Approval Readiness Program", bold: true, color: NAVY })] }),
            new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: `${industry || "Food Business"} — ${lga || "NSW"} LGA`, bold: true })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Prepared by: AMES Food Advisory" })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `Prepared for: ${businessName} (${clientName})` })] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Date: ${today}` })] }),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. Executive Summary", bold: true, color: NAVY })] }),
            new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: `${businessName} is establishing a ${(industry || "food").toLowerCase()} operation in the ${lga || "relevant"} LGA. AMES Food Advisory proposes a structured, ${activePhaseNumbers.length}-phase readiness program designed to ensure the business is fully prepared before formal submission and inspection, rather than relying on the regulator's process to identify and correct issues after the fact.` })] }),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. Background & Objective", bold: true, color: NAVY })] }),
            new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: "The client must satisfy the following regulatory and operational requirements:" })] }),
            ...[
              "Development consent — via Development Application (DA) or Complying Development Certificate (CDC)",
              "Council food business notification / registration",
              "Core food premises fit-out standards, including kitchen/storeroom flooring and hand-washing facilities",
              "General food safety and hygiene obligations under Standards 3.2.2 and 3.2.3 of the Food Standards Code",
            ].map((b) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: b, size: 21 })] })),
            new Paragraph({ spacing: { before: 80, after: 140 }, children: [new TextRun({ text: "The client's objective is to achieve approval/registration and a successful first-time inspection outcome as quickly as possible, without compromising compliance." })] }),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. Scope of Services", bold: true, color: NAVY })] }),
            new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: `AMES Food Advisory proposes the following ${activePhaseNumbers.length}-phase program:` })] }),
            ...scopeParagraphs,

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Why This Approach Reduces Timeframes", bold: true, color: NAVY })] }),
            new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: "AMES Food Advisory is a specialist consultancy, not a regulatory body — we cannot approve premises or bypass statutory processes. Our value lies in eliminating the two most common causes of delay: failed inspections requiring a re-inspection cycle, and incomplete applications returned for resubmission rather than amended in place. By identifying and resolving compliance gaps before any formal submission or inspection, the realistic fastest path to trading is a single, well-prepared application and a first-time inspection pass." })] }),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. Indicative Timeline", bold: true, color: NAVY })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: ["Phase", "Activity", "Indicative Duration"].map((t) => new TableCell({ shading: { fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 20 })] })] })) }),
                ...timelineRows.map((r) => new TableRow({ children: r.map((t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, size: 20 })] })] })) })),
              ],
            }),
            new Paragraph({ spacing: { after: 200 }, children: [] }),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "6. Deliverables", bold: true, color: NAVY })] }),
            ...activePhaseNumbers.flatMap((pNum) =>
              phaseDeliverables[pNum].split(",").map((d) => d.trim()).filter(Boolean).map((d) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: d, size: 21 })] }))
            ),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "7. Indicative Fees", bold: true, color: NAVY })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: ["Phase", "Description", "Fee (ex. GST)", "Fee (incl. GST)"].map((t) => new TableCell({ shading: { fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 20 })] })] })) }),
                ...feeRows,
              ],
            }),
            new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Fees exclude third-party costs such as council application/certification fees, private certifier fees, planning certificate fees, and any physical fit-out works identified during the gap assessment. Prices reflect official AMES Food Advisory published rates (amesfoodadvisory.com.au).", size: 20, italics: true })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Standard terms: 50% deposit payable to commence work, balance on delivery of final documentation. This proposal is valid for 30 days from the date above.", size: 20 })] }),

            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "8. Next Steps", bold: true, color: NAVY })] }),
            ...[
              "Confirm acceptance of this proposal",
              `Schedule Phase 1 — ${phaseTitles[activePhaseNumbers[0] || 1]}`,
              "Engage nominated private certifier (if CDC pathway confirmed) in parallel",
            ].map((b) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: b, size: 21 })] })),

            new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "AMES Food Advisory — Ann-Marie Skarmoutsos | amesfoodadvisory.com.au", size: 18, color: AMBER, italics: true })] }),
          ],
        },
      ],
    });

    const fileName = `AMES_Proposal_${selected.proposalNumber || "proposal"}_${businessName.replace(/\s+/g, "_")}.docx`;
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
    if (onUploadDocument) {
      try {
        await onUploadDocument({
          kind: "proposal",
          businessName,
          proposalNumber: selected.proposalNumber,
          file: blob,
          fileName,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        toast("Proposal saved to OneDrive", "success");
      } catch (error) {
        toast(error.message || "Proposal downloaded but could not be saved to OneDrive", "error");
      }
    }
  };

  return (
    <div className="proposal-page" style={{ padding: "32px 36px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Proposal Selector + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Proposal
          </label>
          <select
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, background: "#ffffff", minWidth: 240 }}
          >
            {proposals.map((p) => (
              <option key={p.id} value={p.id}>{p.proposalNumber ? `${p.proposalNumber} — ` : ""}{p.businessName} — {p.status}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>Created {selected.createdAt || "—"}</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {["Draft", "Sent", "Approved", "Lost"].map((s) => {
            const tone = STATUS_TONE[s];
            const isActive = selected.status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                title={`Mark as ${s}`}
                style={{
                  padding: "6px 14px", borderRadius: 999, border: isActive ? "none" : "1px solid var(--border-color)",
                  background: isActive ? tone.bg : "#ffffff", color: isActive ? tone.color : "var(--ink-mid)",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
            Proposal Generator & Preview
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
            Build a custom package: include/exclude phases, edit titles & pricing, and export branded Word (.docx).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {onAddLegacyProposal && (
            <button
              onClick={() => setShowLegacyEntry((open) => !open)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--navy)", background: showLegacyEntry ? "var(--navy)" : "#ffffff", color: showLegacyEntry ? "#ffffff" : "var(--navy)", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Enter older proposal
            </button>
          )}
          <button
            onClick={persistSnapshot}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)", background: "#ffffff", color: "var(--ink-mid)", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Save size={15} /> Save Snapshot
          </button>
          <button
            onClick={exportDocx}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--primary)", background: "#ffffff", color: "var(--primary)", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            }}
          >
            <Download size={16} /> DOCX</button>

          {selected.status === "Approved" ? (
            <button
              onClick={handleLaunch}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--radius-sm)",
                border: "none", background: "var(--amber)", color: "#ffffff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)",
              }}
            >
              <Rocket size={16} /> Launch Job
            </button>
          ) : (
            <button
              onClick={() => setStatus("Approved")}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--radius-sm)",
                border: "none", background: "var(--primary)", color: "#ffffff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)",
              }}
            >
              <CheckCircle2 size={16} /> Approve Proposal
            </button>
          )}
        </div>
      </div>

      {showLegacyEntry && onAddLegacyProposal && (
        <div style={{ marginBottom: 22, padding: 18, border: "1px solid var(--amber)", borderRadius: "var(--radius-md)", background: "#fffaf4", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Enter an older proposal</div>
              <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--ink-soft)", maxWidth: 640 }}>Use this for proposals created before the portal. Enter the numeric suffix only; the portal will store the full AFA-P-###### format and will not reuse a number already assigned.</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber-dim)", padding: "5px 9px", borderRadius: 999, background: "var(--amber-pale)" }}>LEGACY RECORD</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 12, marginTop: 16 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-soft)" }}>Proposal no.
              <input value={legacyDraft.legacyProposalNumber} onChange={updateLegacyDraft("legacyProposalNumber")} placeholder="10" inputMode="numeric" style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", border: "1px solid var(--border-color)", borderRadius: 6, background: "#ffffff" }} />
            </label>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-soft)" }}>Business name *
              <input value={legacyDraft.businessName} onChange={updateLegacyDraft("businessName")} placeholder="Chew Boy" style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", border: "1px solid var(--border-color)", borderRadius: 6, background: "#ffffff" }} />
            </label>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-soft)" }}>Client name
              <input value={legacyDraft.clientName} onChange={updateLegacyDraft("clientName")} placeholder="Client contact" style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", border: "1px solid var(--border-color)", borderRadius: 6, background: "#ffffff" }} />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-soft)" }}>Email
              <input value={legacyDraft.email} onChange={updateLegacyDraft("email")} placeholder="client@example.com" type="email" style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", border: "1px solid var(--border-color)", borderRadius: 6, background: "#ffffff" }} />
            </label>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-soft)" }}>Address
              <input value={legacyDraft.address} onChange={updateLegacyDraft("address")} placeholder="Business address" style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", border: "1px solid var(--border-color)", borderRadius: 6, background: "#ffffff" }} />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setShowLegacyEntry(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleLegacySubmit}>Save AFA-P-{legacyDraft.legacyProposalNumber || "######"}</button>
          </div>
        </div>
      )}

      {/* Package Builder Controls */}
      <div style={{ background: "#ffffff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", padding: 24, marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--primary)" }}>
            Custom Package & Phase Builder
          </h2>
          <button
            onClick={handleResetToDefaults}
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Reset to AMES Defaults
          </button>
        </div>

        {/* Phase Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {[1, 2, 3, 4].map((pNum) => (
            <div
              key={pNum}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr 130px 110px 1fr",
                gap: 12,
                alignItems: "center",
                padding: 12,
                borderRadius: "var(--radius-sm)",
                border: includedPhases[pNum] ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                background: includedPhases[pNum] ? "#faf9f5" : "#f5f4ef",
                opacity: includedPhases[pNum] ? 1 : 0.6,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <input type="checkbox" checked={includedPhases[pNum]} onChange={() => togglePhase(pNum)} style={{ width: 18, height: 18, cursor: "pointer" }} />
              </label>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", marginBottom: 2 }}>
                  Phase {pNum}
                </div>
                <input
                  type="text"
                  value={phaseTitles[pNum]}
                  onChange={(e) => handleTitleChange(pNum, e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, fontWeight: 600, color: "var(--text-dark)" }}
                />
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 2 }}>Price (ex GST)</div>
                <input
                  type="number"
                  value={phasePricesExGst[pNum]}
                  onChange={(e) => handlePriceChange(pNum, e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, fontWeight: 700, textAlign: "right", color: "var(--primary)" }}
                />
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Incl. GST (10%)</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-dark)" }}>
                  ${((phasePricesExGst[pNum] || 0) * 1.1).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 2 }}>Deliverables (comma separated)</div>
                <input
                  type="text"
                  value={phaseDeliverables[pNum]}
                  onChange={(e) => handleDeliverablesChange(pNum, e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 12.5 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <div style={{ width: 300, background: "var(--primary-light)", padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-muted)", marginBottom: 4 }}>
              <span>Package Subtotal (ex GST):</span>
              <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>${subtotalExGst.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-muted)", marginBottom: 4 }}>
              <span>GST (10%):</span>
              <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>${gstAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "var(--primary)", borderTop: "1px solid var(--border-color)", paddingTop: 8 }}>
              <span>Total (incl GST):</span>
              <span>${totalInclGst.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Template Save / Load */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
          <FolderOpen size={16} color="var(--accent)" />
          <select
            value={activeTemplate}
            onChange={(e) => handleLoadTemplate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, background: "#ffffff", minWidth: 220 }}
          >
            <option value="">Load saved package template...</option>
            {savedTemplates.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>

          {activeTemplate && (
            <button
              onClick={() => handleDeleteTemplate(activeTemplate)}
              style={{ fontSize: 12.5, fontWeight: 600, color: "var(--danger)", background: "var(--danger-bg)", border: "1px solid var(--danger-bg)", padding: "7px 12px", borderRadius: 6, cursor: "pointer" }}
            >
              Delete
            </button>
          )}

          <div style={{ flex: 1 }} />

          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name e.g. NSW Audit Prep Only"
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, width: 240 }}
          />
          <button
            onClick={handleSaveTemplate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid var(--primary)",
              background: "#ffffff",
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Save size={14} /> Save Package Template
          </button>
        </div>
      </div>

      {/* Document Paper Container — Jonathan example layout */}
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
        {/* Navy header band with website logo */}
        <div style={{ background: "var(--navy-deep)", padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <AMESLogo variant="light" size="lg" />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
              Confidential Proposal
            </div>
            <div className="brand-font" style={{ fontSize: 22, fontWeight: 700, color: "var(--amber)" }}>
              OFFICIAL PROPOSAL
            </div>
          </div>
        </div>

        <div style={{ padding: "36px 40px" }}>
          {/* Title block */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
              Food Business Compliance & Council Approval Readiness Program
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>
              {industry} — {lga} LGA
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8 }}>
              Prepared by: <strong>AMES Food Advisory</strong>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Prepared for: <strong>{businessName}</strong> ({clientName})
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Date: {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* 1. Executive Summary */}
          <ProposalSection num={1} title="Executive Summary">
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-dark)" }}>
              {businessName} is establishing a {industry.toLowerCase()} operation in the {lga} LGA. AMES Food Advisory proposes a structured, {activePhaseNumbers.length}-phase readiness program designed to compress the approval timeline by ensuring the business is fully prepared before formal submission and inspection — rather than relying on council's process to identify and correct issues after the fact.
            </p>
          </ProposalSection>

          {/* 2. Background & Objective */}
          <ProposalSection num={2} title="Background & Objective">
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-dark)", marginBottom: 8 }}>
              The client must satisfy the following regulatory and operational requirements:
            </p>
            <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
              <li>Development consent — via Development Application (DA) or Complying Development Certificate (CDC)</li>
              <li>Council food business notification / registration</li>
              <li>Core food premises fit-out standards, including kitchen/storeroom flooring and hand-washing facilities</li>
              <li>General food safety and hygiene obligations under Standards 3.2.2 and 3.2.3 of the Food Standards Code</li>
            </ul>
          </ProposalSection>

          {/* 3. Scope of Services */}
          <ProposalSection num={3} title={`Scope of Services (${activePhaseNumbers.length}-Phase Program)`}>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 12 }}>
              AMES Food Advisory proposes the following program:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activePhaseNumbers.map((pNum) => (
                <div key={pNum} style={{ background: "var(--stone)", padding: 12, borderRadius: 6, border: "1px solid var(--border-color)" }}>
                  <strong style={{ color: "var(--navy)", fontSize: 14 }}>Phase {pNum} — {phaseTitles[pNum]}</strong>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
                    {phaseDeliverables[pNum]}
                  </p>
                </div>
              ))}
            </div>
          </ProposalSection>

          {/* 4. Why This Approach Reduces Timeframes */}
          <ProposalSection num={4} title="Why This Approach Reduces Timeframes">
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-dark)" }}>
              AMES Food Advisory is a specialist consultancy, not a regulatory body — we cannot approve premises or bypass statutory processes. Our value lies in eliminating the two most common causes of delay: failed inspections requiring a re-inspection cycle, and incomplete applications returned for resubmission rather than amended in place. By identifying and resolving compliance gaps before any formal submission or inspection, the realistic fastest path to trading is a single, well-prepared application and a first-time inspection pass.
            </p>
          </ProposalSection>

          {/* 5. Indicative Timeline */}
          <ProposalSection num={5} title="Indicative Timeline">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--navy)", color: "#ffffff" }}>
                  <th style={{ padding: "8px 12px" }}>Phase</th>
                  <th style={{ padding: "8px 12px" }}>Activity</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Indicative Duration</th>
                </tr>
              </thead>
              <tbody>
                {activePhaseNumbers.map((pNum) => (
                  <tr key={pNum} style={{ borderBottom: "1px solid var(--stone-mid)" }}>
                    <td style={{ padding: "8px 12px" }}>{pNum}</td>
                    <td style={{ padding: "8px 12px" }}>{phaseTitles[pNum]}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>{pNum === 1 ? "5–7 business days" : "TBA"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ProposalSection>

          {/* 6. Deliverables */}
          <ProposalSection num={6} title="Deliverables">
            <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
              {activePhaseNumbers.flatMap((pNum) =>
                phaseDeliverables[pNum]
                  .split(",")
                  .map((d) => d.trim())
                  .filter(Boolean)
                  .map((d, i) => <li key={`${pNum}-${i}`}>{d}</li>)
              )}
            </ul>
          </ProposalSection>

          {/* 7. Indicative Fees */}
          <ProposalSection num={7} title="Indicative Fees">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--navy)", color: "#ffffff" }}>
                  <th style={{ padding: "8px 12px" }}>Phase</th>
                  <th style={{ padding: "8px 12px" }}>Description</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Fee (ex. GST)</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Fee (incl. GST)</th>
                </tr>
              </thead>
              <tbody>
                {activePhaseNumbers.map((pNum) => (
                  <tr key={pNum} style={{ borderBottom: "1px solid var(--stone-mid)" }}>
                    <td style={{ padding: "8px 12px" }}>{pNum}</td>
                    <td style={{ padding: "8px 12px" }}>{phaseTitles[pNum]}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>${phasePricesExGst[pNum].toFixed(2)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>${(phasePricesExGst[pNum] * 1.1).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ background: "var(--amber-pale)", fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: "10px 12px" }}>Program Total (incl. GST)</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>${subtotalExGst.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--amber-dim)" }}>${totalInclGst.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: 11.5, color: "var(--ink-muted)", fontStyle: "italic", marginTop: 8 }}>
              Fees exclude third-party costs such as council application/certification fees, private certifier fees, planning certificate fees, and any physical fit-out works identified during the gap assessment.
            </p>
          </ProposalSection>

          {/* 8. Next Steps */}
          <ProposalSection num={8} title="Next Steps">
            <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
              <li>Confirm acceptance of this proposal</li>
              <li>Schedule Phase 1 — {phaseTitles[activePhaseNumbers[0] || 1]}</li>
              <li>Engage nominated private certifier (if CDC pathway confirmed) in parallel</li>
            </ul>
          </ProposalSection>

          {/* Footer */}
          <div style={{ borderTop: "2px solid var(--navy)", paddingTop: 14, marginTop: 28 }}>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic" }}>
              AMES Food Advisory — Ann-Marie Skarmoutsos | amesfoodadvisory.com.au · (02) 7822 0109
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProposalSection({ num, title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", borderBottom: "2px solid var(--navy)", paddingBottom: 4, marginBottom: 8 }}>
        {num}. {title}
      </h3>
      {children}
    </div>
  );
}
