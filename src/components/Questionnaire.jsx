import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Factory,
  Truck,
  Heart,
  Home,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  FileSpreadsheet,
} from "lucide-react";

const INDUSTRIES = [
  {
    id: "restaurant",
    label: "Restaurant / Café / Takeaway",
    icon: ChefHat,
    pathway: "Registers with local council. NSW Food Authority if specific high-risk process triggers it.",
  },
  {
    id: "manufacturer",
    label: "Food Manufacturer / Processor",
    icon: Factory,
    pathway: "Likely NSW Food Authority licensing rather than council-only registration.",
  },
  {
    id: "catering",
    label: "Catering Operations",
    icon: Truck,
    pathway: "Registers with local council — confirm base kitchen is a registered commercial premises.",
  },
  {
    id: "vulnerable",
    label: "Childcare / Aged Care / Hospital",
    icon: Heart,
    pathway: "Vulnerable-persons food service — expect closer NSW Food Authority scrutiny.",
  },
  {
    id: "home",
    label: "Home-Based Food Business",
    icon: Home,
    pathway: "Council DA/CDC & notification required once trading commercially.",
  },
  {
    id: "rto",
    label: "RTO / Training Provider",
    icon: GraduationCap,
    pathway: "Training content/delivery compliance rather than a Food Safety Program.",
  },
];

const GAP_LABELS = ["Needs building", "Partial"];

function computeScope(industryId, answers, practiceQuestions) {
  const lineItems = [];
  let tier = "Startup Essentials";
  let basis = "single-site, standard-risk";

  const gapCount = practiceQuestions.filter((q) => GAP_LABELS.includes(answers[q.id])).length;

  const autoFlags = {
    multisite: answers.core8 && answers.core8 !== "Single site only",
    firsttime: answers.core9 === "No",
    groupTraining: answers.core6 === "5–9" || answers.core6 === "10–19" || answers.core6 === "20+",
    needsFSSTraining: answers.core5 === "Need training" || answers.core5 === "Unsure",
    vulnerable: industryId === "vulnerable" || answers.c5 === "Yes",
  };

  lineItems.push("Food Safety Program (FSP) development");
  lineItems.push("HACCP hazard analysis & control points");
  lineItems.push("NSW Food Authority / council registration guidance");

  if (autoFlags.needsFSSTraining) {
    lineItems.push(autoFlags.groupTraining ? "FSS training — on-site group session" : "FSS training — individual certification pathway");
  }
  if (gapCount >= 6) {
    lineItems.push("Full SOP suite build (cleaning, allergen, supplier, hygiene, cross-contamination)");
    tier = "Full Compliance Build";
  } else if (gapCount >= 2) {
    lineItems.push("SOP gap-fill (targeted, not full rebuild)");
  }
  lineItems.push("Mock EHO inspection / audit-readiness review");

  if (industryId === "manufacturer") {
    lineItems.push("NSW Food Authority licensing support");
    tier = "Complex / Regulated";
    basis = "manufacturer — licensed category";
  }
  if (autoFlags.vulnerable) {
    lineItems.push("Vulnerable-persons documentation tier (dietitian sign-off alignment, individual dietary tracking)");
    tier = "Complex / Regulated";
    basis = "vulnerable-persons service — elevated scrutiny";
  }

  return { tier, basis, lineItems, gapCount, autoFlags };
}

export default function Questionnaire({
  selectedClient,
  questionsData = {},
  onSaveProposal,
  setActiveTab,
}) {
  const [step, setStep] = useState(0);
  const [clientName, setClientName] = useState(selectedClient?.clientName || "");
  const [businessName, setBusinessName] = useState(selectedClient?.businessName || "");
  const [industryId, setIndustryId] = useState(selectedClient?.industryId || "restaurant");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (selectedClient) {
      setClientName(selectedClient.clientName);
      setBusinessName(selectedClient.businessName);
      if (selectedClient.industryId) setIndustryId(selectedClient.industryId);
    }
  }, [selectedClient]);

  const industry = INDUSTRIES.find((i) => i.id === industryId);
  const coreQuestions = questionsData.core || [];
  const practiceQuestions = questionsData.practices || [];
  const industryQuestions = questionsData[industryId] || [];
  const scope = industry ? computeScope(industry.id, answers, practiceQuestions) : null;

  const setAnswer = (id, val) => setAnswers((a) => ({ ...a, [id]: val }));

  const steps = ["client-select", "core", "practices", "industry-specific", "summary"];
  const currentKey = steps[step];

  const handleGenerateProposal = () => {
    const proposalData = {
      clientName: clientName || "Valued Client",
      businessName: businessName || "Food Business",
      industryId,
      industry: industry.label,
      lga: answers.core2 || selectedClient?.lga || "Parramatta",
      answers,
      scope,
    };
    onSaveProposal(proposalData);
    setActiveTab("proposals");
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
          Client Scoping & Qualification
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
          Structured intake evaluation to automatically calculate regulatory scope and drive proposal generation.
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {steps.map((s, idx) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: idx <= step ? "var(--primary)" : "var(--border-color)",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* Step 1: Client & Industry Selection */}
      {currentKey === "client-select" && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>
            Select Client & Industry Sector
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Montao Quality Bakery"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--border-color)", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>Primary Contact</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Jonathan Montao"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid var(--border-color)", marginTop: 4 }}
              />
            </div>
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", display: "block", marginBottom: 12 }}>
            Food Industry Sector
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              const isSelected = industryId === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setIndustryId(ind.id)}
                  style={{
                    padding: 16,
                    borderRadius: "var(--radius-sm)",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    background: isSelected ? "var(--primary-light)" : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Icon size={22} color="var(--primary)" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", marginTop: 8 }}>{ind.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Core Intake Questions */}
      {currentKey === "core" && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>Core Compliance Intake</h2>
          {coreQuestions.map((q) => (
            <QField key={q.id} item={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
          ))}
        </div>
      )}

      {/* Step 3: Food Safety Practice Gaps */}
      {currentKey === "practices" && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>Food Safety Practice Assessment</h2>
          {practiceQuestions.map((q) => (
            <QField key={q.id} item={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
          ))}
        </div>
      )}

      {/* Step 4: Industry Specific Questions */}
      {currentKey === "industry-specific" && industry && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>{industry.label} — Industry Scoping</h2>
          {industryQuestions.map((q) => (
            <QField key={q.id} item={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
          ))}
        </div>
      )}

      {/* Step 5: Scoping Summary & Launch Proposal */}
      {currentKey === "summary" && scope && (
        <div style={{ background: "#ffffff", padding: 28, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)", marginBottom: 6 }}>Scoping Assessment Results</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 20 }}>Recommended program scope auto-derived from intake answers.</p>

          <div style={{ background: "var(--primary-light)", padding: 18, borderRadius: "var(--radius-sm)", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>Recommended Tier</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>{scope.tier}</div>
            <div style={{ fontSize: 13, color: "var(--text-dark)", marginTop: 4 }}>Basis: {scope.basis}</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>Included Scope Line Items:</h3>
            <ul style={{ paddingLeft: 20, fontSize: 13.5, lineHeight: 1.8 }}>
              {scope.lineItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleGenerateProposal}
            style={{
              width: "100%",
              padding: "14px 24px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "var(--primary)",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <FileSpreadsheet size={18} />
            <span>Generate & Review Branded Proposal</span>
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: "9px 18px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "#ffffff",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: step === 0 ? "default" : "pointer",
            opacity: step === 0 ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {step < steps.length - 1 && (
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            style={{
              padding: "9px 20px",
              borderRadius: 6,
              border: "none",
              background: "var(--primary)",
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Next <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function QField({ item, value, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  const options = item.options || [];

  if (item.type === "yesno") {
    return (
      <div style={{ marginBottom: 16 }}>
        <QLabel item={item} />
        <div style={{ display: "flex", gap: 8 }}>
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                padding: "7px 18px",
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                border: value === opt ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                background: value === opt ? "var(--primary)" : "#ffffff",
                color: value === opt ? "#ffffff" : "var(--text-dark)",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (item.type === "date") {
    return (
      <div style={{ marginBottom: 16 }}>
        <QLabel item={item} />
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", maxWidth: 420, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, background: "#ffffff" }}
        />
      </div>
    );
  }

  if (item.type === "select") {
    const isCustomValue = typeof value === "string" && value !== "" && !options.includes(value);
    const showCustomInput = showCustom || isCustomValue;
    return (
      <div style={{ marginBottom: 16 }}>
        <QLabel item={item} />
        <select
          value={isCustomValue ? "__custom__" : value || ""}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              setShowCustom(true);
              setCustomText("");
              onChange("");
            } else {
              setShowCustom(false);
              onChange(e.target.value);
            }
          }}
          style={{ width: "100%", maxWidth: 420, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, background: "#ffffff" }}
        >
          <option value="" disabled>Select option...</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
          <option value="__custom__">Other / add custom answer…</option>
        </select>
        {showCustomInput && (
          <input
            type="text"
            value={isCustomValue ? value : customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Type custom answer…"
            style={{ width: "100%", maxWidth: 420, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--primary)", fontSize: 13.5, marginTop: 6, background: "var(--primary-light)" }}
          />
        )}
      </div>
    );
  }

  // multiselect
  const arr = Array.isArray(value) ? value : [];
  const customEntries = arr.filter((x) => !options.includes(x));
  const presetEntries = arr.filter((x) => options.includes(x));

  const addCustomEntry = () => {
    const text = customText.trim();
    if (!text) return;
    if (!arr.includes(text)) onChange([...arr, text]);
    setCustomText("");
    setAddingCustom(false);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <QLabel item={item} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const checked = presetEntries.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => {
                const next = checked ? arr.filter((x) => x !== o) : [...arr, o];
                onChange(next);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: checked ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                background: checked ? "var(--primary-light)" : "#ffffff",
                color: checked ? "var(--primary)" : "var(--text-dark)",
              }}
            >
              {checked && <Check size={13} />}{o}
            </button>
          );
        })}

        {customEntries.map((c) => (
          <span
            key={c}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: "2px solid var(--accent)",
              background: "var(--accent-light)",
              color: "var(--text-dark)",
            }}
          >
            {c}
            <button
              type="button"
              onClick={() => onChange(arr.filter((x) => x !== c))}
              style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
            >
              <X size={13} />
            </button>
          </span>
        ))}

        {!addingCustom ? (
          <button
            type="button"
            onClick={() => setAddingCustom(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px dashed var(--accent)",
              background: "transparent",
              color: "var(--accent)",
            }}
          >
            <Plus size={13} /> Add custom answer
          </button>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              autoFocus
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomEntry();
                }
              }}
              placeholder="Type custom answer…"
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid var(--primary)", fontSize: 13, background: "var(--primary-light)", width: 180 }}
            />
            <button type="button" onClick={addCustomEntry} style={{ padding: "6px 10px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#ffffff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Add
            </button>
            <button type="button" onClick={() => { setAddingCustom(false); setCustomText(""); }} style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border-color)", background: "#ffffff", fontSize: 12.5, cursor: "pointer" }}>
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

function QLabel({ item }) {
  return (
    <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-dark)", marginBottom: 6 }}>
      {item.cat && <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>{item.cat}</span>}
      {item.q}
    </label>
  );
}
