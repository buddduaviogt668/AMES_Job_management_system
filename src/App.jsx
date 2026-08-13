import React, { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ClientCRM from "./components/ClientCRM";
import Questionnaire from "./components/Questionnaire";
import QuestionStudio from "./components/QuestionStudio";
import ProposalViewer from "./components/ProposalViewer";
import InvoiceGenerator from "./components/InvoiceGenerator";
import JobBoard from "./components/JobBoard";
import Calendar from "./components/Calendar";
import Leads from "./components/Leads";
import Financials from "./components/Financials";
import Expenses from "./components/Expenses";
import KmLog from "./components/KmLog";
import TaxSummary from "./components/TaxSummary";
import Recurring from "./components/Recurring";
import Settings from "./components/Settings";
import ToastHost, { toast } from "./components/common/Toasts";
import AMESLogo from "./components/common/AMESLogo";
import { LayoutDashboard, Target, CalendarDays, Receipt, Kanban, Menu } from "lucide-react";
import useCloudSync from "./hooks/useCloudSync";
import { downloadBackup, parseBackup } from "./lib/sync";
import {
  INITIAL_CLIENTS,
  INITIAL_JOBS,
  INITIAL_PROPOSALS,
  INITIAL_LEADS,
  INITIAL_EXPENSES,
  INITIAL_KM_ENTRIES,
  INITIAL_RECURRING,
  INITIAL_SETTINGS,
} from "./data/initialData";
import { buildDefaultQuestionsData, mergeQuestionsWithBase } from "./data/questions";

const INITIAL_INVOICES = [
  {
    id: "inv_100010",
    invoiceNumber: "AFA-100010",
    proposalRef: "AFA-P-100010",
    clientName: "Jonathan Montao",
    businessName: "Montao Quality Bakery",
    email: "jonathan@montaobakery.com.au",
    address: "123 Market Street, Blacktown NSW 2148",
    issueDate: "2026-08-08",
    dueDate: "2026-08-22",
    status: "Unpaid",
    lineItems: [
      { description: "Site Audit / Gap Assessment Fee (Phase 1)", priceExGst: 595.0, qty: 1 },
      { description: "HACCP Food Safety Program Documentation Build (Phase 2)", priceExGst: 1500.0, qty: 1 },
    ],
  },
];

const DEFAULT_PHASES = [
  {
    phaseNum: 1,
    title: "Gap Assessment (Mock EHO Inspection)",
    status: "Not Started",
    tasks: [
      { text: "Schedule on-site gap assessment walk-through", done: false },
      { text: "Inspect flooring, handwashing, & hygiene setup", done: false },
      { text: "Issue written gap assessment report", done: false },
    ],
  },
  {
    phaseNum: 2,
    title: "Food Safety Documentation & Procedures",
    status: "Not Started",
    tasks: [
      { text: "Draft Food Safety Program (FSP) & HACCP plan", done: false },
      { text: "Build cleaning, allergen & cross-contamination SOPs", done: false },
      { text: "Confirm Food Safety Supervisor (FSS) pathway", done: false },
    ],
  },
  {
    phaseNum: 3,
    title: "Registration Pathway & Council Liaison",
    status: "Not Started",
    tasks: [
      { text: "Confirm DA / CDC or Council registration pathway", done: false },
      { text: "Review application package prior to submission", done: false },
    ],
  },
  {
    phaseNum: 4,
    title: "Final Readiness Review",
    status: "Not Started",
    tasks: [
      { text: "Final walk-through prior to Council inspection", done: false },
      { text: "Verify documentation on-site", done: false },
    ],
  },
];

function loadLS(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClientForQuestionnaire, setSelectedClientForQuestionnaire] = useState(null);

  const [clients, setClients] = useState(() => loadLS("ames_clients", INITIAL_CLIENTS));
  const [jobs, setJobs] = useState(() => loadLS("ames_jobs", INITIAL_JOBS));
  const [proposals, setProposals] = useState(() => loadLS("ames_proposals", INITIAL_PROPOSALS));
  const [leads, setLeads] = useState(() => loadLS("ames_leads", INITIAL_LEADS));
  const [expenses, setExpenses] = useState(() => loadLS("ames_expenses", INITIAL_EXPENSES));
  const [kmEntries, setKmEntries] = useState(() => loadLS("ames_km_entries", INITIAL_KM_ENTRIES));
  const [recurringItems, setRecurringItems] = useState(() => loadLS("ames_recurring", INITIAL_RECURRING));
  const [settings, setSettings] = useState(() => ({ ...INITIAL_SETTINGS, ...loadLS("ames_settings", {}) }));

  const [invoices, setInvoices] = useState(() => {
    const parsed = loadLS("ames_invoices", null);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_INVOICES;
    let max = 100009;
    const normalized = parsed.map((inv) => {
      const raw = inv && inv.invoiceNumber;
      const m = typeof raw === "string" && raw.match(/^AFA(?:-P-|_P_|-)?(\d+)$/);
      const num = m ? `AFA-${m[1]}` : `AFA-${max + 1}`;
      const n = parseInt(num.slice(4), 10);
      if (n > max) max = n;
      const oldItems = Array.isArray(inv && inv.items)
        ? inv.items.map((it) => ({
            description: it.description || it.name || "Service",
            priceExGst: Number(it.priceExGst || it.price || 0),
            qty: Number(it.qty || 1),
          }))
        : [];
      return {
        ...(inv || {}),
        id: (inv && inv.id) || "inv_" + num.replace(/\D/g, ""),
        invoiceNumber: num,
        jobRef: (inv && inv.jobRef) || `AFA-P-${n}`,
        clientName: (inv && inv.clientName) || "",
        businessName: (inv && inv.businessName) || "",
        issueDate: (inv && inv.issueDate) || "",
        dueDate: (inv && inv.dueDate) || "",
        status: (inv && inv.status) || "Unpaid",
        lineItems: Array.isArray(inv && inv.lineItems) ? inv.lineItems : oldItems,
      };
    });
    return normalized.length ? normalized : INITIAL_INVOICES;
  });

  const [questionsData, setQuestionsData] = useState(() => {
    try {
      const saved = localStorage.getItem("ames_questions_studio");
      return saved ? mergeQuestionsWithBase(JSON.parse(saved)) : buildDefaultQuestionsData();
    } catch {
      return buildDefaultQuestionsData();
    }
  });

  useEffect(() => {
    localStorage.setItem("ames_clients", JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem("ames_jobs", JSON.stringify(jobs));
  }, [jobs]);
  useEffect(() => {
    localStorage.setItem("ames_invoices", JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem("ames_proposals", JSON.stringify(proposals));
  }, [proposals]);
  useEffect(() => {
    localStorage.setItem("ames_leads", JSON.stringify(leads));
  }, [leads]);
  useEffect(() => {
    localStorage.setItem("ames_expenses", JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem("ames_km_entries", JSON.stringify(kmEntries));
  }, [kmEntries]);
  useEffect(() => {
    localStorage.setItem("ames_recurring", JSON.stringify(recurringItems));
  }, [recurringItems]);
  useEffect(() => {
    localStorage.setItem("ames_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("ames_questions_studio", JSON.stringify(questionsData));
  }, [questionsData]);

  // ---- Clients ----
  const handleAddClient = (newClient) => setClients((prev) => [newClient, ...prev]);
  const handleUpdateClient = (updatedClient) => setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  const handleDeleteClient = (clientId) => setClients((prev) => prev.filter((c) => c.id !== clientId));

  // ---- Invoices ----
  const handleAddInvoice = (newInv) => setInvoices((prev) => [newInv, ...prev]);
  const handleUpdateInvoice = (updatedInv) => setInvoices((prev) => prev.map((i) => (i.id === updatedInv.id ? updatedInv : i)));
  const handleDeleteInvoice = (invoiceId) => setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));

  // Shared AFA numbering (proposal/job = AFA-P-####, invoice = AFA-####) — one numeric sequence
  const nextAFANumber = () => {
    let max = 100009;
    const scan = (list, key) =>
      list.forEach((it) => {
        const v = it[key];
        if (v) {
          const m = String(v).match(/(\d+)$/);
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
      });
    scan(proposals, "proposalNumber");
    scan(invoices, "invoiceNumber");
    scan(jobs, "jobNumber");
    return max + 1;
  };

  // ---- Proposals ----
  const handleSaveProposal = (proposalData) => {
    const nextNum =
      proposals.reduce((acc, p) => {
        const m = p.proposalNumber && String(p.proposalNumber).match(/^AFA-P-(\d+)$/);
        return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
      }, invoices.reduce((acc, i) => {
        const m = i.invoiceNumber && String(i.invoiceNumber).match(/^AFA-P-(\d+)$/);
        return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
      }, 100009)) + 1;
    const proposal = {
      id: "prop_" + Date.now(),
      proposalNumber: `AFA-P-${nextNum}`,
      clientId: proposalData.clientId || (proposalData.clientName && clients.find((c) => c.clientName === proposalData.clientName)?.id) || "cli_new",
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      snapshot: null,
      ...proposalData,
    };
    setProposals((prev) => [proposal, ...prev]);
    setClients((prev) =>
      prev.map((c) =>
        c.businessName === proposal.businessName ? { ...c, status: "Active Proposal" } : c
      )
    );
    toast(`Proposal ${proposal.proposalNumber} generated for ${proposal.businessName}`, "success");
  };

  const handleUpdateProposal = (id, patch) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const prop = proposals.find((p) => p.id === id);
    if (prop && patch.status) {
      setClients((prev) =>
        prev.map((c) =>
          c.businessName === prop.businessName && patch.status === "Approved"
            ? { ...c, status: "Job In Progress" }
            : c
        )
      );
    }
  };

  const handleLaunchJob = (proposal) => {
    const snap = proposal.snapshot || {};
    const included = snap.includedPhases || { 1: true, 2: true, 3: true, 4: true };
    const titles = snap.phaseTitles || {};
    const phases = DEFAULT_PHASES.filter((ph) => included[ph.phaseNum]).map((ph) => ({
      ...ph,
      title: titles[ph.phaseNum] || ph.title,
    }));

    const nextNum = jobs.reduce((max, j) => {
      const m = j.jobNumber && j.jobNumber.match(/^AFA-J(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 1000) + 1;

    const newJob = {
      id: "job_" + Date.now(),
      jobNumber: proposal.proposalNumber || `AFA-P-${nextNum}`,
      clientId: proposal.clientId || "cli_new",
      clientName: proposal.clientName,
      businessName: proposal.businessName,
      industryId: proposal.industryId,
      lga: proposal.lga,
      currentPhase: 1,
      targetCompletion: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      scheduledDate: "",
      scheduledTime: "",
      status: "In Progress",
      attachments: [],
      activityLog: [
        {
          id: "act_" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          text: `Job launched from approved proposal for ${proposal.businessName}.`,
          type: "milestone",
        },
      ],
      phases,
    };

    setJobs((prev) => [newJob, ...prev]);
    setProposals((prev) => prev.map((p) => (p.id === proposal.id ? { ...p, status: "Approved", launchedJobId: newJob.id } : p)));
    setClients((prev) =>
      prev.map((c) => (c.businessName === proposal.businessName ? { ...c, status: "Job In Progress" } : c))
    );
    toast(`Job ${newJob.jobNumber} launched`, "success");
    setActiveTab("jobboard");
  };

  // ---- Jobs ----
  const handleUpdateJob = (updatedJob) => setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  const handleDeleteJob = (jobId) => setJobs((prev) => prev.filter((j) => j.id !== jobId));

  // Create a job directly (calendar booking) with auto-assigned AFA-P-#### number
  const handleAddJob = (booking) => {
    const nextNum = nextAFANumber();
    const newJob = {
      id: "job_" + Date.now(),
      jobNumber: `AFA-P-${nextNum}`,
      clientId: booking.clientId || "cli_new",
      clientName: booking.clientName || "",
      businessName: booking.businessName,
      industryId: booking.industryId || "",
      lga: booking.lga || "",
      currentPhase: 1,
      targetCompletion: booking.targetCompletion || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      scheduledDate: booking.scheduledDate || "",
      scheduledTime: booking.scheduledTime || "",
      status: "In Progress",
      attachments: [],
      activityLog: [
        {
          id: "act_" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          text: `Job booked on the calendar for ${booking.businessName}.`,
          type: "milestone",
        },
      ],
      phases: DEFAULT_PHASES.map((ph) => ({ ...ph })),
    };
    setJobs((prev) => [newJob, ...prev]);
    toast(`Job ${newJob.jobNumber} booked`, "success");
    return newJob;
  };

  // ---- Leads ----
  const handleAddLead = (lead) => setLeads((prev) => [lead, ...prev]);
  const handleUpdateLead = (updated) => setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  const handleDeleteLead = (leadId) => setLeads((prev) => prev.filter((l) => l.id !== leadId));
  const handleConvertToClient = (lead) => {
    const client = {
      id: "cli_" + Date.now(),
      clientName: lead.name,
      businessName: lead.businessName,
      industry: lead.industry,
      industryId: lead.industryId || "restaurant",
      lga: lead.lga || "",
      phone: lead.phone || "",
      email: lead.email || "",
      address: "",
      status: "New Intake",
      createdDate: new Date().toISOString().split("T")[0],
      notes: lead.notes || "",
    };
    setClients((prev) => [client, ...prev]);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: "Converted" } : l)));
    toast(`Lead converted — ${client.businessName} added to CRM`, "success");
    setActiveTab("clients");
  };

  // ---- Expenses ----
  const handleAddExpense = (exp) => setExpenses((prev) => [exp, ...prev]);
  const handleUpdateExpense = (updated) => setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  const handleDeleteExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  // ---- Km Log ----
  const handleAddKm = (km) => setKmEntries((prev) => [km, ...prev]);
  const handleUpdateKm = (updated) => setKmEntries((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
  const handleDeleteKm = (id) => setKmEntries((prev) => prev.filter((k) => k.id !== id));

  // ---- Recurring ----
  const handleAddRecurring = (item) => setRecurringItems((prev) => [item, ...prev]);
  const handleUpdateRecurring = (updated) => setRecurringItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  const handleDeleteRecurring = (id) => setRecurringItems((prev) => prev.filter((r) => r.id !== id));

  // ---- Settings ----
  const handleUpdateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    toast("Settings saved", "success");
  };

  // ---- Backup / Cloud Sync ----
  const store = useMemo(
    () => ({ clients, jobs, invoices, proposals, leads, expenses, kmEntries, recurringItems, settings }),
    [clients, jobs, invoices, proposals, leads, expenses, kmEntries, recurringItems, settings]
  );

  const applyRemote = useCallback((data) => {
    if (data.clients) setClients(data.clients);
    if (data.jobs) setJobs(data.jobs);
    if (data.invoices) setInvoices(data.invoices);
    if (data.proposals) setProposals(data.proposals);
    if (data.leads) setLeads(data.leads);
    if (data.expenses) setExpenses(data.expenses);
    if (data.kmEntries) setKmEntries(data.kmEntries);
    if (data.recurringItems) setRecurringItems(data.recurringItems);
    if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
  }, []);

  const { status: syncStatus, pushNow, pullNow } = useCloudSync(store, applyRemote);

  const handleExportBackup = () => {
    downloadBackup(store);
    toast("Backup downloaded", "success");
  };

  const handleRestoreBackup = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackup(reader.result);
        applyRemote(parsed);
        toast("Backup restored", "success");
      } catch {
        toast("Could not parse backup file", "error");
      }
    };
    reader.readAsText(file);
  };

  // ---- Mobile ----
  const navigate = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };
  const mobileNavItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Target },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "jobboard", label: "Jobs", icon: Kanban },
  ];

  return (
    <div className={sidebarOpen ? "sidebar-open" : ""} style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex" }}
        >
          <Menu size={22} />
        </button>
        <AMESLogo variant="light" size="sm" showTagline={false} />
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigate}
        clientsCount={clients.length}
        jobsCount={jobs.filter((j) => j.status === "In Progress").length}
        invoicesCount={invoices.filter((i) => i.status !== "Paid").length}
        leadsCount={leads.filter((l) => l.status === "New" || l.status === "Contacted" || l.status === "Qualified").length}
      />

      <main className="app-main" style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "dashboard" && (
          <Dashboard
            clients={clients}
            jobs={jobs}
            invoices={invoices}
            proposals={proposals}
            recurringItems={recurringItems}
            leads={leads}
            setActiveTab={setActiveTab}
            setSelectedClientForQuestionnaire={setSelectedClientForQuestionnaire}
          />
        )}

        {activeTab === "clients" && (
          <ClientCRM
            clients={clients}
            jobs={jobs}
            invoices={invoices}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            onSelectForQuestionnaire={(client) => {
              setSelectedClientForQuestionnaire(client);
              setActiveTab("questionnaire");
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "questionnaire" && (
          <Questionnaire
            selectedClient={selectedClientForQuestionnaire}
            clients={clients}
            questionsData={questionsData}
            onSaveProposal={handleSaveProposal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "studio" && (
          <QuestionStudio
            questionsData={questionsData}
            onUpdateQuestionsData={setQuestionsData}
          />
        )}

        {activeTab === "proposals" && (
          <ProposalViewer
            proposals={proposals}
            onUpdateProposal={handleUpdateProposal}
            onLaunchJob={handleLaunchJob}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "invoices" && (
          <InvoiceGenerator
            invoices={invoices}
            clients={clients}
            proposals={proposals}
            settings={settings}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === "jobboard" && (
          <JobBoard
            jobs={jobs}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeTab === "calendar" && (
          <Calendar
            jobs={jobs}
            onUpdateJob={handleUpdateJob}
            onAddJob={handleAddJob}
            nextJobNumber={`AFA-P-${nextAFANumber()}`}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "leads" && (
          <Leads
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onConvertToClient={handleConvertToClient}
          />
        )}

        {activeTab === "financials" && (
          <Financials
            clients={clients}
            jobs={jobs}
            invoices={invoices}
            expenses={expenses}
          />
        )}

        {activeTab === "expenses" && (
          <Expenses
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === "kmlog" && (
          <KmLog
            kmEntries={kmEntries}
            onAddKm={handleAddKm}
            onUpdateKm={handleUpdateKm}
            onDeleteKm={handleDeleteKm}
          />
        )}

        {activeTab === "tax" && (
          <TaxSummary
            invoices={invoices}
            expenses={expenses}
            kmEntries={kmEntries}
          />
        )}

        {activeTab === "recurring" && (
          <Recurring
            recurringItems={recurringItems}
            onAddItem={handleAddRecurring}
            onUpdateItem={handleUpdateRecurring}
            onDeleteItem={handleDeleteRecurring}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportBackup={handleExportBackup}
            onRestoreBackup={handleRestoreBackup}
            syncStatus={syncStatus}
            onPush={pushNow}
            onPull={pullNow}
          />
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <ToastHost />
    </div>
  );
}
