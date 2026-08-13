import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Plus } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtDay = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
};

export default function Calendar({ jobs, onUpdateJob, onAddJob, nextJobNumber, setActiveTab }) {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()));
  const [scheduleJobId, setScheduleJobId] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [showBookForm, setShowBookForm] = useState(false);
  const [book, setBook] = useState({ businessName: "", clientName: "", lga: "", industry: "", time: "09:00" });

  const monthStart = startOfMonth(cursor);
  const offset = monthStart.getDay();
  const today = new Date();

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const jobsOn = (iso) => jobs.filter((j) => j.scheduledDate === iso);
  const dayJobs = jobsOn(selectedDate);

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const handleSchedule = () => {
    const job = jobs.find((j) => j.id === scheduleJobId);
    if (!job) return;
    onUpdateJob({ ...job, scheduledDate: selectedDate, scheduledTime: scheduleTime });
    setScheduleJobId("");
  };

  const handleUnschedule = (job) => {
    const next = { ...job };
    delete next.scheduledDate;
    delete next.scheduledTime;
    onUpdateJob(next);
  };

  const handleBook = () => {
    if (!book.businessName.trim()) return;
    const job = onAddJob({
      businessName: book.businessName.trim(),
      clientName: book.clientName.trim(),
      lga: book.lga.trim() || "NSW",
      industryId: book.industry.trim(),
      scheduledDate: selectedDate,
      scheduledTime: book.time,
    });
    if (job) {
      setBook({ businessName: "", clientName: "", lga: "", industry: "", time: "09:00" });
      setShowBookForm(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            Site Audit Calendar
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 2 }}>
            Schedule and track site audits, mock EHO inspections and milestone visits.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={prevMonth}
            style={{ padding: "8px 12px", border: "1px solid var(--border-color)", background: "#ffffff", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronLeft size={16} color="var(--navy)" />
          </button>
          <button
            onClick={() => setCursor(new Date())}
            style={{ padding: "8px 14px", border: "1px solid var(--border-color)", background: "#ffffff", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--navy)" }}
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            style={{ padding: "8px 12px", border: "1px solid var(--border-color)", background: "#ffffff", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronRight size={16} color="var(--navy)" />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) 340px", gap: 24 }}>
        {/* Month Grid */}
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>
            {cursor.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-muted)", textAlign: "center" }}>
                {w}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const iso = toISO(day);
              const dayJobsList = jobsOn(iso);
              const isToday = sameDay(day, today);
              const isSelected = iso === selectedDate;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(iso)}
                  style={{
                    minHeight: 72,
                    padding: 6,
                    borderRadius: "var(--radius-sm)",
                    border: isSelected ? "2px solid var(--amber)" : isToday ? "1px solid var(--navy)" : "1px solid var(--border-light)",
                    background: isSelected ? "var(--amber-pale)" : isToday ? "var(--primary-light)" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? "var(--navy)" : "var(--ink-mid)" }}>
                    {day.getDate()}
                  </span>
                  {dayJobsList.slice(0, 2).map((j) => (
                    <div key={j.id} style={{ fontSize: 10, fontWeight: 700, color: "#ffffff", background: "var(--navy)", borderRadius: 4, padding: "2px 5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {j.businessName}
                    </div>
                  ))}
                  {dayJobsList.length > 2 && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--amber-dim)" }}>
                      +{dayJobsList.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CalendarDays size={16} color="var(--amber)" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{fmtDay(selectedDate)}</h3>
            </div>

            {dayJobs.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--ink-muted)", padding: "10px 0" }}>
                No audits scheduled this day.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayJobs.map((j) => (
                  <div key={j.id} style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{j.businessName}</div>
                      <button onClick={() => handleUnschedule(j)} style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", background: "var(--danger-bg)", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} /> {j.scheduledTime || "All day"}
                      <span>·</span>
                      <MapPin size={12} /> {j.lga || "NSW"} LGA
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Book New Job
              </h3>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber-dim)", background: "var(--amber-pale)", padding: "3px 8px", borderRadius: 999 }}>
                Next: {nextJobNumber}
              </span>
            </div>

            {!showBookForm ? (
              <button
                onClick={() => setShowBookForm(true)}
                style={{ width: "100%", padding: "9px 14px", borderRadius: 6, border: "1px dashed var(--navy)", background: "var(--primary-light)", color: "var(--navy)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Plus size={14} /> New Booking on {fmtDay(selectedDate)}
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="text"
                  value={book.businessName}
                  onChange={(e) => setBook({ ...book, businessName: e.target.value })}
                  placeholder="Business / Client name *"
                  style={bookInput}
                />
                <input
                  type="text"
                  value={book.clientName}
                  onChange={(e) => setBook({ ...book, clientName: e.target.value })}
                  placeholder="Contact person"
                  style={bookInput}
                />
                <input
                  type="text"
                  value={book.lga}
                  onChange={(e) => setBook({ ...book, lga: e.target.value })}
                  placeholder="Council / LGA (e.g. Blacktown)"
                  style={bookInput}
                />
                <input
                  type="text"
                  value={book.industry}
                  onChange={(e) => setBook({ ...book, industry: e.target.value })}
                  placeholder="Industry (e.g. Restaurant)"
                  style={bookInput}
                />
                <input
                  type="time"
                  value={book.time}
                  onChange={(e) => setBook({ ...book, time: e.target.value })}
                  style={bookInput}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleBook}
                    disabled={!book.businessName.trim()}
                    style={{ flex: 1, padding: "9px 14px", borderRadius: 6, border: "none", background: book.businessName.trim() ? "var(--navy)" : "var(--border-light)", color: book.businessName.trim() ? "#ffffff" : "var(--ink-muted)", fontSize: 13, fontWeight: 700, cursor: book.businessName.trim() ? "pointer" : "not-allowed" }}
                  >
                    Book Job → AFA-P-{String(nextJobNumber).replace("AFA-P-", "")}
                  </button>
                  <button
                    onClick={() => setShowBookForm(false)}
                    style={{ padding: "9px 12px", borderRadius: 6, border: "1px solid var(--border-color)", background: "#ffffff", color: "var(--ink-mid)", fontSize: 13, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
              Schedule Job on {fmtDay(selectedDate)}
            </h3>
            <select
              value={scheduleJobId}
              onChange={(e) => setScheduleJobId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, marginBottom: 8, background: "#ffffff" }}
            >
              <option value="">Select a job...</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.businessName}</option>
              ))}
            </select>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, marginBottom: 12, background: "#ffffff" }}
            />
            <button
              onClick={handleSchedule}
              disabled={!scheduleJobId}
              style={{
                width: "100%", padding: "9px 14px", borderRadius: 6, border: "none",
                background: scheduleJobId ? "var(--navy)" : "var(--border-light)", color: scheduleJobId ? "#ffffff" : "var(--ink-muted)",
                fontSize: 13, fontWeight: 700, cursor: scheduleJobId ? "pointer" : "not-allowed",
              }}
            >
              Schedule Site Visit
            </button>
          </div>

          <button
            onClick={() => setActiveTab("jobboard")}
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            Open Job Management →
          </button>
        </div>
      </div>
    </div>
  );
}

const bookInput = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, background: "#ffffff", boxSizing: "border-box" };
