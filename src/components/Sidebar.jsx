import React from "react";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  FileSpreadsheet,
  Kanban,
  PlusCircle,
  Sliders,
  Receipt,
  CalendarDays,
  Target,
  Wallet,
  Car,
  Calculator,
  RotateCcw,
  Settings as SettingsIcon,
  LineChart,
} from "lucide-react";
import AMESLogo from "./common/AMESLogo";

export default function Sidebar({ activeTab, setActiveTab, clientsCount, jobsCount, invoicesCount, leadsCount }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Client CRM", icon: Users, badge: clientsCount },
    { id: "leads", label: "Leads", icon: Target, badge: leadsCount },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "questionnaire", label: "Qualification Portal", icon: FileCheck },
    { id: "proposals", label: "Proposal Generator", icon: FileSpreadsheet },
    { id: "invoices", label: "Tax Invoices", icon: Receipt, badge: invoicesCount },
    { id: "jobboard", label: "Job Management", icon: Kanban, badge: jobsCount },
  ];

  const financialItems = [
    { id: "financials", label: "Financial Overview", icon: LineChart },
    { id: "expenses", label: "Expenses", icon: Wallet },
    { id: "kmlog", label: "Km Log", icon: Car },
    { id: "tax", label: "Tax Summary", icon: Calculator },
    { id: "recurring", label: "Recurring Compliance", icon: RotateCcw },
  ];

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderRadius: 8,
          border: "none",
          background: isActive ? "rgba(212,117,31,0.18)" : "transparent",
          color: isActive ? "#ffffff" : "rgba(255,255,255,0.62)",
          fontSize: 13.5,
          fontWeight: isActive ? 700 : 500,
          cursor: "pointer",
          textAlign: "left",
          position: "relative",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "18%",
              bottom: "18%",
              width: 3,
              background: "var(--amber)",
              borderRadius: "0 2px 2px 0",
            }}
          />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Icon size={17} color={isActive ? "#ffffff" : "rgba(255,255,255,0.55)"} />
          <span>{item.label}</span>
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 999,
              background: isActive ? "var(--amber)" : "rgba(255,255,255,0.14)",
              color: "#ffffff",
              lineHeight: 1.5,
            }}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const renderSectionLabel = (text) => (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        color: "rgba(255,255,255,0.28)",
        padding: "14px 12px 8px",
      }}
    >
      {text}
    </div>
  );

  return (
    <aside
      className="sidebar"
      style={{
        width: 260,
        backgroundColor: "var(--navy-deep)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        boxShadow: "4px 0 20px rgba(0,0,0,0.25)",
        zIndex: 10,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "22px 20px 18px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <AMESLogo variant="light" size="sm" />
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: "14px 12px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {renderSectionLabel("Operations")}
        {navItems.map(renderNavItem)}
        {renderSectionLabel("Finance & Compliance")}
        {financialItems.map(renderNavItem)}
        {renderSectionLabel("System")}
        {renderNavItem({ id: "studio", label: "Question Studio", icon: Sliders })}
        {renderNavItem({ id: "settings", label: "Settings", icon: SettingsIcon })}
      </nav>

      {/* Quick Action Footer */}
      <div
        style={{
          padding: 16,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(0, 0, 0, 0.18)",
        }}
      >
        <button
          onClick={() => setActiveTab("questionnaire")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--amber)",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(212,117,31,0.35)",
          }}
        >
          <PlusCircle size={16} />
          <span>New Qualification</span>
        </button>
        <div style={{ textAlign: "center", fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
          (02) 7822 0109 &nbsp;·&nbsp; amesfoodadvisory.com.au
        </div>
      </div>
    </aside>
  );
}
