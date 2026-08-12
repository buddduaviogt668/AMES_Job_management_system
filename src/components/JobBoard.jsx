import React, { useState } from "react";
import {
  Kanban,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  Paperclip,
  Trash2,
  X,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";
import { toast } from "./common/Toasts";

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};

export default function JobBoard({ jobs, onUpdateJob, onDeleteJob }) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [newLogText, setNewLogText] = useState("");
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  const logActivity = (job, text, type = "note") => {
    const entry = { id: "act_" + Date.now() + Math.random().toString(36).slice(2, 6), date: new Date().toISOString().split("T")[0], text, type };
    return onUpdateJob({ ...job, activityLog: [...(job.activityLog || []), entry] });
  };

  const handleToggleTask = (job, phaseIdx, taskIdx) => {
    const updatedPhases = job.phases.map((ph, pIdx) => {
      if (pIdx !== phaseIdx) return ph;
      const updatedTasks = ph.tasks.map((t, tIdx) => (tIdx === taskIdx ? { ...t, done: !t.done } : t));
      const allDone = updatedTasks.every((t) => t.done);
      return { ...ph, tasks: updatedTasks, status: allDone ? "Completed" : updatedTasks.some((t) => t.done) ? "In Progress" : ph.status };
    });
    const allPhasesDone = updatedPhases.every((p) => p.status === "Completed");
    onUpdateJob({ ...job, phases: updatedPhases, status: allPhasesDone ? "Completed" : job.status });
  };

  const handleAdvancePhase = (job) => {
    if (job.currentPhase >= 4) return;
    const nextPhase = job.currentPhase + 1;
    const updatedPhases = job.phases.map((ph, idx) => (idx === nextPhase - 1 ? { ...ph, status: "In Progress" } : ph));
    onUpdateJob({ ...job, currentPhase: nextPhase, phases: updatedPhases });
    logActivity({ ...job, currentPhase: nextPhase, phases: updatedPhases }, `Advanced to Phase ${nextPhase} — ${updatedPhases[nextPhase - 1].title}`, "milestone");
  };

  const handleRevertPhase = (job) => {
    if (job.currentPhase <= 1) return;
    onUpdateJob({ ...job, currentPhase: job.currentPhase - 1 });
    logActivity(job, `Reverted to Phase ${job.currentPhase - 1}`, "note");
  };

  const handleCompleteJob = (job) => {
    const updatedPhases = job.phases.map((ph) => ({ ...ph, status: "Completed", tasks: ph.tasks.map((t) => ({ ...t, done: true })) }));
    onUpdateJob({ ...job, status: "Completed", currentPhase: 4, phases: updatedPhases });
    logActivity({ ...job, status: "Completed", phases: updatedPhases }, "Job completed — certification readiness confirmed", "milestone");
    toast("Job marked as completed", "success");
  };

  const handleSaveSchedule = () => {
    if (!selectedJob || !scheduleDate) return;
    const updated = { ...selectedJob, scheduledDate: scheduleDate, scheduledTime: scheduleTime || selectedJob.scheduledTime };
    onUpdateJob(updated);
    logActivity(updated, `Scheduled site visit for ${fmtDate(scheduleDate)}${scheduleTime ? " at " + scheduleTime : ""}`, "milestone");
    toast("Schedule saved", "success");
  };

  const handleAttachmentUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !selectedJob) return;
    const reader = new FileReader();
    reader.onload = () => {
      const attachment = {
        id: "att_" + Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: String(reader.result),
        addedAt: new Date().toISOString().split("T")[0],
      };
      const updated = { ...selectedJob, attachments: [...(selectedJob.attachments || []), attachment] };
      onUpdateJob(updated);
      logActivity(updated, `Attached file: ${file.name}`, "attachment");
      setShowAttachmentUpload(false);
      toast("Attachment added", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (job, attId) => {
    const updated = { ...job, attachments: (job.attachments || []).filter((a) => a.id !== attId) };
    onUpdateJob(updated);
    toast("Attachment removed", "info");
  };

  const handleAddLog = () => {
    if (!newLogText.trim() || !selectedJob) return;
    logActivity(selectedJob, newLogText.trim());
    setNewLogText("");
    toast("Activity logged", "success");
  };

  const handleDeleteJob = (job) => {
    if (!window.confirm(`Delete job ${job.jobNumber} for ${job.businessName}? This cannot be undone.`)) return;
    onDeleteJob(job.id);
    toast("Job deleted", "info");
  };

  const progressPct = selectedJob ? Math.round((selectedJob.currentPhase / 4) * 100) : 0;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
          Job & Audit Management
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 2 }}>
          Track compliance delivery across the 4 AMES readiness phases from Gap Assessment to EHO Final Pass.
        </p>
      </div>

      {!selectedJob ? (
        <div style={{ background: "#ffffff", padding: 40, textAlign: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <Kanban size={32} color="var(--navy)" />
          <h3 style={{ fontSize: 18, color: "var(--navy)", marginTop: 12 }}>No Active Jobs</h3>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4 }}>
            Approve a proposal and Launch Job to create an active job.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
          {/* Left: job list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Active Client Jobs ({jobs.length})
            </h3>
            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isDone = job.status === "Completed";
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    padding: 14,
                    borderRadius: "var(--radius-sm)",
                    border: isSelected ? "2px solid var(--amber)" : "1px solid var(--border-color)",
                    background: isSelected ? "var(--amber-pale)" : "#ffffff",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy)" }}>
                      {job.jobNumber || "AFA-J####"}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: isDone ? "var(--success-bg)" : "var(--warning-bg)", color: isDone ? "var(--success)" : "var(--warning-text)" }}>
                      {isDone ? "COMPLETED" : `Phase ${job.currentPhase}/4`}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 6 }}>{job.businessName}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                    {job.clientName} | {job.lga} LGA
                  </div>
                  {job.scheduledDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--ink-muted)", marginTop: 6 }}>
                      <Calendar size={12} /> {fmtDate(job.scheduledDate)}{job.scheduledTime ? ` · ${job.scheduledTime}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: detail */}
          <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-light)", paddingBottom: 16, marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{selectedJob.jobNumber}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: selectedJob.status === "Completed" ? "var(--success-bg)" : "var(--primary-light)", color: selectedJob.status === "Completed" ? "var(--success)" : "var(--navy)" }}>
                    {selectedJob.status.toUpperCase()}
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)", marginTop: 4 }}>{selectedJob.businessName}</h2>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
                  Client: {selectedJob.clientName} | Council: {selectedJob.lga} LGA | Target: {fmtDate(selectedJob.targetCompletion)}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {selectedJob.status !== "Completed" && (
                    <>
                      {selectedJob.currentPhase < 4 && (
                        <button onClick={() => handleAdvancePhase(selectedJob)} style={actionBtn("var(--navy)", "#ffffff")}>
                          <ChevronRight size={14} /> Advance Phase
                        </button>
                      )}
                      {selectedJob.currentPhase > 1 && (
                        <button onClick={() => handleRevertPhase(selectedJob)} style={actionBtn("#ffffff", "var(--ink-mid)", "1px solid var(--border-color)")}>
                          <ChevronLeft size={14} />
                        </button>
                      )}
                      <button onClick={() => handleCompleteJob(selectedJob)} style={actionBtn("var(--success)", "#ffffff")}>
                        <Award size={14} /> Complete
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDeleteJob(selectedJob)} style={actionBtn("var(--danger-bg)", "var(--danger)")}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber-dim)" }}>{progressPct}% complete</div>
              </div>
            </div>

            {/* Schedule editor */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 20, padding: 14, background: "var(--stone)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Site Visit Date</div>
                <input type="date" value={selectedJob.scheduledDate || ""} onChange={(e) => setScheduleDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Time</div>
                <input type="time" value={selectedJob.scheduledTime || ""} onChange={(e) => setScheduleTime(e.target.value)} style={inputStyle} />
              </div>
              <button onClick={handleSaveSchedule} style={actionBtn("var(--navy)", "#ffffff")}>
                <Calendar size={14} /> Save Schedule
              </button>
              <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: "auto" }}>
                Current: {fmtDate(selectedJob.scheduledDate)}{selectedJob.scheduledTime ? ` at ${selectedJob.scheduledTime}` : " — not scheduled"}
              </span>
            </div>

            {/* Phases */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {selectedJob.phases.map((ph, pIdx) => {
                const isCurrent = selectedJob.currentPhase === ph.phaseNum;
                const isDone = ph.status === "Completed";
                return (
                  <div key={ph.phaseNum} style={{ borderRadius: "var(--radius-sm)", border: isCurrent ? "2px solid var(--navy)" : "1px solid var(--border-light)", background: isCurrent ? "#ffffff" : "var(--stone)", padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 13, background: isDone ? "var(--success)" : isCurrent ? "var(--navy)" : "var(--border-color)", color: "#ffffff", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isDone ? <CheckCircle2 size={15} /> : ph.phaseNum}
                        </span>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--navy)" }}>Phase {ph.phaseNum}: {ph.title}</h4>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: isDone ? "var(--success-bg)" : isCurrent ? "var(--amber-pale)" : "var(--border-light)", color: isDone ? "var(--success)" : isCurrent ? "var(--amber-dim)" : "var(--ink-muted)" }}>
                        {ph.status}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingLeft: 36 }}>
                      {ph.tasks.map((t, tIdx) => (
                        <div key={tIdx} onClick={() => handleToggleTask(selectedJob, pIdx, tIdx)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.done ? "var(--ink-muted)" : "var(--ink)", textDecoration: t.done ? "line-through" : "none", cursor: "pointer" }}>
                          <span style={{ width: 16, height: 16, borderRadius: 4, border: t.done ? "none" : "1px solid var(--border-color)", background: t.done ? "var(--success)" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 11 }}>
                            {t.done ? "✓" : ""}
                          </span>
                          <span>{t.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attachments */}
            <div style={{ marginTop: 24, borderTop: "1px solid var(--border-light)", paddingTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                  <Paperclip size={14} /> Attachments ({selectedJob.attachments?.length || 0})
                </h4>
                {!showAttachmentUpload ? (
                  <button onClick={() => setShowAttachmentUpload(true)} style={actionBtn("var(--amber)", "#ffffff")}>
                    <Plus size={14} /> Attach File
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="file" onChange={handleAttachmentUpload} style={{ fontSize: 12.5 }} />
                    <button onClick={() => setShowAttachmentUpload(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <X size={16} color="var(--ink-soft)" />
                    </button>
                  </div>
                )}
              </div>
              {(selectedJob.attachments?.length || 0) === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>No attachments yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selectedJob.attachments.map((att) => (
                    <div key={att.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 6, background: "var(--stone)", border: "1px solid var(--border-light)" }}>
                      <Paperclip size={13} color="var(--amber-dim)" />
                      <a href={att.data} download={att.name} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {att.name}
                      </a>
                      <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{att.addedAt}</span>
                      <button onClick={() => handleRemoveAttachment(selectedJob, att.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity log */}
            <div style={{ marginTop: 20, borderTop: "1px solid var(--border-light)", paddingTop: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Clock size={14} /> Activity Log
              </h4>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={newLogText}
                  onChange={(e) => setNewLogText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLog()}
                  placeholder="Log a note, milestone or update..."
                  style={{ flex: 1, ...inputStyle }}
                />
                <button onClick={handleAddLog} style={actionBtn("var(--navy)", "#ffffff")}>
                  <MessageSquarePlus size={14} /> Add
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                {(!selectedJob.activityLog || selectedJob.activityLog.length === 0) ? (
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>No activity recorded yet.</div>
                ) : (
                  [...selectedJob.activityLog].reverse().map((act) => (
                    <div key={act.id} style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--ink-mid)" }}>
                      <span style={{ color: "var(--ink-muted)", whiteSpace: "nowrap", fontFamily: "DM Mono, monospace", fontSize: 11 }}>{act.date}</span>
                      <span>{act.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, background: "#ffffff" };

const actionBtn = (bg, color, border) => ({
  display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6,
  border: border || "none", background: bg, color, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
});
