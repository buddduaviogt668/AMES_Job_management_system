import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  Briefcase,
  Edit2,
  Trash2,
  X,
  Receipt,
} from "lucide-react";
import Chip from "./common/Chip";

export default function ClientCRM({
  clients,
  jobs,
  invoices,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onSelectForQuestionnaire,
  setActiveTab,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    clientName: "",
    businessName: "",
    industryId: "restaurant",
    industry: "Restaurant / Café / Takeaway",
    lga: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const filteredClients = clients.filter(
    (c) =>
      (industryFilter === "All" || c.industryId === industryFilter) &&
      (c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.lga && c.lga.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const industryTabs = [
    { value: "All", label: "All" },
    ...Array.from(new Set(clients.map((c) => c.industryId))).map((id) => ({
      value: id,
      label: clients.find((c) => c.industryId === id)?.industry || id,
    })),
  ];

  const clientJobs = (client) => jobs.filter((j) => j.clientId === client.id || j.businessName === client.businessName);
  const clientInvoices = (client) => invoices.filter((i) => i.businessName === client.businessName || i.clientName === client.clientName);
  const statusTone = (status) => {
    const s = status || "Client";
    if (s === "Job In Progress") return "navy";
    if (s === "Active Proposal") return "amber";
    if (s === "Completed") return "success";
    if (s === "New Intake") return "warning";
    return "neutral";
  };

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      clientName: "",
      businessName: "",
      industryId: "restaurant",
      industry: "Restaurant / Café / Takeaway",
      lga: "Parramatta",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.clientName) return;

    if (editingClient) {
      onUpdateClient({ ...editingClient, ...formData });
    } else {
      onAddClient({
        ...formData,
        id: "cli_" + Date.now(),
        status: "New Intake",
        createdDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <h1 className="brand-font" style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
            Client CRM Directory
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
            Manage client business profiles, contact details, and compliance qualifications.
          </p>
        </div>

        <button
          onClick={openNewModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--primary)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Plus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 14px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Search size={18} color="var(--ink-muted)" />
          <input
            type="text"
            placeholder="Search by business name, client contact, or LGA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--text-dark)",
              background: "transparent",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {industryTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setIndustryFilter(t.value)}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid var(--border-color)",
                background: industryFilter === t.value ? "var(--navy)" : "#ffffff",
                color: industryFilter === t.value ? "#ffffff" : "var(--ink-mid)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label}
              <span style={{ opacity: 0.7, marginLeft: 5 }}>{t.value === "All" ? clients.length : clients.filter((c) => c.industryId === t.value).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {filteredClients.map((client) => (
          <div
            key={client.id}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: 20,
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--primary)" }}>
                    {client.businessName}
                  </h3>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginTop: 1 }}>
                    {client.industry}
                  </div>
                </div>

                <Chip tone={statusTone(client.status)}>{client.status || "Client"}</Chip>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0", fontSize: 13, color: "var(--text-dark)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase size={14} color="var(--text-muted)" />
                  <span><strong>{clientJobs(client).length}</strong> job{clientJobs(client).length === 1 ? "" : "s"}</span>
                </div>
                <span style={{ color: "var(--border-color)" }}>•</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Receipt size={14} color="var(--text-muted)" />
                  <span><strong>{clientInvoices(client).length}</strong> invoice{clientInvoices(client).length === 1 ? "" : "s"}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6, fontSize: 13, color: "var(--text-dark)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span><strong>Contact:</strong> {client.clientName}</span>
                </div>
                {client.lga && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={14} color="var(--text-muted)" />
                    <span><strong>LGA / Council:</strong> {client.lga}</span>
                  </div>
                )}
                {client.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic", background: "#fcfbf7", padding: 8, borderRadius: 6, border: "1px solid var(--border-light)" }}>
                  "{client.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                borderTop: "1px solid var(--border-light)",
                paddingTop: 14,
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => openEditModal(client)}
                  title="Edit Client"
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    background: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "var(--text-dark)",
                  }}
                >
                  <Edit2 size={13} /> Edit
                </button>

                <button
                  onClick={() => onDeleteClient(client.id)}
                  title="Delete Client"
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--danger-bg)",
                    background: "var(--danger-bg)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "var(--danger)",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <button
                onClick={() => {
                  onSelectForQuestionnaire(client);
                  setActiveTab("questionnaire");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--primary)",
                  color: "#ffffff",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <FileCheck size={14} /> Start Qualification
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", background: "var(--card-bg)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
            <Users size={26} color="var(--text-muted)" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>No clients match your search</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Try a different search term or industry filter.</div>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: 520,
              padding: 24,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                {editingClient ? "Edit Client Profile" : "Add New Client Profile"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Montao Quality Bakery"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Jonathan Montao"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                    Industry Sector
                  </label>
                  <select
                    value={formData.industryId}
                    onChange={(e) => {
                      const labels = {
                        restaurant: "Restaurant / Café / Takeaway",
                        manufacturer: "Food Manufacturer / Processor",
                        catering: "Catering Operations",
                        vulnerable: "Childcare / Aged Care / Hospital",
                        home: "Home-Based Food Business",
                        rto: "RTO / Training Provider",
                      };
                      setFormData({
                        ...formData,
                        industryId: e.target.value,
                        industry: labels[e.target.value],
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                      background: "#ffffff",
                    }}
                  >
                    <option value="restaurant">Restaurant / Café / Takeaway</option>
                    <option value="manufacturer">Food Manufacturer / Processor</option>
                    <option value="catering">Catering Operations</option>
                    <option value="vulnerable">Childcare / Aged Care / Hospital</option>
                    <option value="home">Home-Based Food Business</option>
                    <option value="rto">RTO / Training Provider</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                    LGA / Council
                  </label>
                  <input
                    type="text"
                    value={formData.lga}
                    onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                    placeholder="e.g. Blacktown"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0400 000 000"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                  Consultant Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key background, food risk details, opening date targets..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                    background: "#ffffff",
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 18px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--primary)",
                    color: "#ffffff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {editingClient ? "Save Changes" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
