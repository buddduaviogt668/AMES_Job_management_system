import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { buildDefaultQuestionsData } from "../data/questions";

export default function QuestionStudio({
  questionsData,
  onUpdateQuestionsData,
}) {
  const [selectedIndustry, setSelectedIndustry] = useState("restaurant");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("select");
  const [newQuestionOptions, setNewQuestionOptions] = useState("");
  const [newQuestionCat, setNewQuestionCat] = useState("");

  const industries = [
    { id: "restaurant", label: "Restaurant / Café / Takeaway" },
    { id: "manufacturer", label: "Food Manufacturer / Processor" },
    { id: "catering", label: "Catering Operations" },
    { id: "vulnerable", label: "Childcare / Aged Care / Hospital" },
    { id: "home", label: "Home-Based Food Business" },
    { id: "rto", label: "RTO / Training Provider" },
    { id: "core", label: "Core Intake Questions" },
    { id: "practices", label: "Food Safety Practice Gaps" },
  ];

  const currentQuestions = questionsData[selectedIndustry] || [];

  const updateQuestions = (nextQuestions) => {
    onUpdateQuestionsData({
      ...questionsData,
      [selectedIndustry]: nextQuestions,
    });
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText) return;

    const opts = newQuestionOptions
      ? newQuestionOptions.split(",").map((s) => s.trim()).filter(Boolean)
      : ["In place", "Partial", "Needs building"];

    const newQ = {
      id: `custom_${Date.now()}`,
      q: newQuestionText,
      type: newQuestionType,
      options: opts,
      cat: newQuestionCat || undefined,
    };

    updateQuestions([...currentQuestions, newQ]);

    setNewQuestionText("");
    setNewQuestionOptions("");
    setNewQuestionCat("");
  };

  const handleDeleteQuestion = (qId) => {
    updateQuestions(currentQuestions.filter((q) => q.id !== qId));
    if (editingId === qId) {
      setEditingId(null);
      setEditDraft(null);
    }
  };

  const handleStartEdit = (q) => {
    setEditingId(q.id);
    setEditDraft({
      q: q.q,
      type: q.type || "select",
      options: q.options ? q.options.join(", ") : "",
      cat: q.cat || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editDraft || !editDraft.q.trim()) return;
    updateQuestions(
      currentQuestions.map((q) =>
        q.id === editingId
          ? {
              ...q,
              q: editDraft.q.trim(),
              type: editDraft.type,
              options:
                editDraft.type === "yesno" || editDraft.type === "date"
                  ? undefined
                  : editDraft.options
                      ? editDraft.options.split(",").map((s) => s.trim()).filter(Boolean)
                      : ["In place", "Partial", "Needs building"],
              cat: editDraft.cat.trim() || undefined,
            }
          : q
      )
    );
    setEditingId(null);
    setEditDraft(null);
  };

  const handleMove = (idx, dir) => {
    const next = [...currentQuestions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    updateQuestions(next);
  };

  const handleResetIndustry = () => {
    if (!window.confirm(`Reset "${industries.find((i) => i.id === selectedIndustry)?.label}" back to the default question bank? Custom questions for this section will be removed.`)) return;
    updateQuestions(buildDefaultQuestionsData()[selectedIndustry] || []);
    setEditingId(null);
    setEditDraft(null);
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
          Questionnaire & Intake Studio
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
          Add, edit, reorder, or remove questions per industry pathway. Custom questions automatically populate the Scoping Questionnaire.
        </p>
      </div>

      {/* Sector Tab Selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 24 }}>
        {industries.map((ind) => (
          <button
            key={ind.id}
            onClick={() => {
              setSelectedIndustry(ind.id);
              setEditingId(null);
              setEditDraft(null);
            }}
            style={{
              padding: "9px 16px",
              borderRadius: "var(--radius-sm)",
              border: selectedIndustry === ind.id ? "2px solid var(--primary)" : "1px solid var(--border-color)",
              background: selectedIndustry === ind.id ? "var(--primary)" : "#ffffff",
              color: selectedIndustry === ind.id ? "#ffffff" : "var(--text-dark)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {ind.label} ({questionsData[ind.id]?.length || 0})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Questions List Editor */}
        <div style={{ background: "#ffffff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>
              Custom Questions for {industries.find((i) => i.id === selectedIndustry)?.label}
            </h3>
            {currentQuestions.length > 0 && (
              <button
                onClick={handleResetIndustry}
                title="Reset custom questions for this section"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--danger)",
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--danger-bg)",
                  background: "var(--danger-bg)",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} /> Reset Section
              </button>
            )}
          </div>

          {currentQuestions.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)" }}>
              No custom questions yet for this section. Add one using the form on the right.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentQuestions.map((q, idx) => {
                const isEditing = editingId === q.id;
                return (
                  <div
                    key={q.id}
                    style={{
                      padding: 14,
                      borderRadius: "var(--radius-sm)",
                      border: isEditing ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                      background: isEditing ? "var(--primary-light)" : "#faf9f5",
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input
                          type="text"
                          value={editDraft.q}
                          onChange={(e) => setEditDraft({ ...editDraft, q: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5 }}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <select
                            value={editDraft.type}
                            onChange={(e) => setEditDraft({ ...editDraft, type: e.target.value })}
                            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, background: "#ffffff" }}
                          >
                            <option value="select">Dropdown Select</option>
                            <option value="multiselect">Multi-select Checkbox</option>
                            <option value="yesno">Yes / No Button</option>
                            <option value="date">Date Input</option>
                          </select>
                          <input
                            type="text"
                            value={editDraft.cat}
                            onChange={(e) => setEditDraft({ ...editDraft, cat: e.target.value })}
                            placeholder="Category tag"
                            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13 }}
                          />
                        </div>
                        {editDraft.type !== "yesno" && editDraft.type !== "date" && (
                          <input
                            type="text"
                            value={editDraft.options}
                            onChange={(e) => setEditDraft({ ...editDraft, options: e.target.value })}
                            placeholder="Options (comma separated)"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13 }}
                          />
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={handleSaveEdit}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 6, border: "none", background: "var(--primary)", color: "#ffffff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                          >
                            <Check size={14} /> Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditDraft(null);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", color: "var(--text-dark)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                          >
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          {q.cat && (
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", display: "block" }}>
                              {q.cat}
                            </span>
                          )}
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)", marginTop: 2 }}>
                            {idx + 1}. {q.q}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                            Type: <strong>{q.type}</strong> | Options: {q.options ? q.options.join(", ") : "Yes/No"}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            onClick={() => handleMove(idx, -1)}
                            disabled={idx === 0}
                            title="Move Up"
                            style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.35 : 1 }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMove(idx, 1)}
                            disabled={idx === currentQuestions.length - 1}
                            title="Move Down"
                            style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", cursor: idx === currentQuestions.length - 1 ? "default" : "pointer", opacity: idx === currentQuestions.length - 1 ? 0.35 : 1 }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(q)}
                            title="Edit Question"
                            style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", color: "var(--primary)", cursor: "pointer" }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Remove Question"
                            style={{ padding: 6, borderRadius: 6, border: "1px solid var(--danger-bg)", background: "var(--danger-bg)", color: "var(--danger)", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Question Form */}
        <div style={{ background: "#ffffff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", padding: 24, height: "fit-content" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>
            Add Custom Question
          </h3>

          <form onSubmit={handleAddQuestion} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>Question Text *</label>
              <textarea
                rows={3}
                required
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. Do you require custom allergen labelling sign-off?"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, marginTop: 4 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>Question Type</label>
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, marginTop: 4, background: "#ffffff" }}
              >
                <option value="select">Dropdown Select</option>
                <option value="multiselect">Multi-select Checkbox</option>
                <option value="yesno">Yes / No Button</option>
                <option value="date">Date Input</option>
              </select>
            </div>

            {newQuestionType !== "yesno" && newQuestionType !== "date" && (
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>Options (comma separated)</label>
                <input
                  type="text"
                  value={newQuestionOptions}
                  onChange={(e) => setNewQuestionOptions(e.target.value)}
                  placeholder="In place, Partial, Needs building"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, marginTop: 4 }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>Category Tag (Optional)</label>
              <input
                type="text"
                value={newQuestionCat}
                onChange={(e) => setNewQuestionCat(e.target.value)}
                placeholder="e.g. Allergen Control"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13.5, marginTop: 4 }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                background: "var(--primary)",
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 6,
              }}
            >
              <Plus size={16} /> Add Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
