export const INDUSTRIES = [
  { id: "restaurant", label: "Restaurant / Café / Takeaway" },
  { id: "manufacturer", label: "Food Manufacturer / Processor" },
  { id: "catering", label: "Catering Operations" },
  { id: "vulnerable", label: "Childcare / Aged Care / Hospital" },
  { id: "home", label: "Home-Based Food Business" },
  { id: "rto", label: "RTO / Training Provider" },
];

export const LEAD_SOURCES = ["Website", "Referral", "Phone Call", "Market / Event", "Social Media", "Walk-in", "Other"];

export const INITIAL_CLIENTS = [
  {
    id: "cli_1",
    clientName: "Jonathan Montao",
    businessName: "Montao Quality Bakery",
    industryId: "home",
    industry: "Home-Based Food Business",
    lga: "Blacktown",
    phone: "0412 345 678",
    email: "jonathan@montaobakery.com.au",
    address: "123 Market Street, Blacktown NSW 2148",
    status: "Active Proposal",
    createdDate: "2026-08-08",
    notes: "Produces low-risk pastries & custard-filled products for direct sales at weekend markets.",
  },
  {
    id: "cli_2",
    clientName: "Maria Santos",
    businessName: "Artisan Kitchen Co",
    industryId: "restaurant",
    industry: "Restaurant / Café / Takeaway",
    lga: "Parramatta",
    phone: "0498 765 432",
    email: "maria@artisankitchen.com.au",
    address: "45 Church Street, Parramatta NSW 2150",
    status: "Job In Progress",
    createdDate: "2026-08-01",
    notes: "Opening a mid-turnover café with on-site raw prep and high-volume catering delivery.",
  },
];

export const INITIAL_JOBS = [
  {
    id: "job_1",
    jobNumber: "AFA-J1001",
    clientId: "cli_2",
    clientName: "Maria Santos",
    businessName: "Artisan Kitchen Co",
    industryId: "restaurant",
    lga: "Parramatta",
    currentPhase: 2, // Phase 2: Documentation
    targetCompletion: "2026-09-15",
    scheduledDate: "2026-08-18",
    scheduledTime: "09:30",
    status: "In Progress",
    attachments: [],
    activityLog: [
      { id: "act_1", date: "2026-08-01", text: "Proposal approved — job launched from proposal AFA-100010.", type: "milestone" },
      { id: "act_2", date: "2026-08-10", text: "Phase 1 gap assessment completed on-site.", type: "milestone" },
    ],
    phases: [
      {
        phaseNum: 1,
        title: "Gap Assessment (Mock EHO Inspection)",
        status: "Completed",
        tasks: [
          { text: "On-site assessment against fit-out standards", done: true },
          { text: "Flooring, handwashing & canopy inspection", done: true },
          { text: "Written gap report issued to client", done: true },
        ],
      },
      {
        phaseNum: 2,
        title: "Food Safety Documentation & Procedures",
        status: "In Progress",
        tasks: [
          { text: "Develop Food Safety Program (FSP) & HACCP plan", done: true },
          { text: "Build SOPs for cleaning, cooling & allergen management", done: false },
          { text: "Confirm Food Safety Supervisor (FSS) certification", done: false },
        ],
      },
      {
        phaseNum: 3,
        title: "Registration Pathway & Council Liaison",
        status: "Not Started",
        tasks: [
          { text: "Confirm Parramatta Council registration category", done: false },
          { text: "Prepare & quality-check registration submission", done: false },
        ],
      },
      {
        phaseNum: 4,
        title: "Final Readiness Review",
        status: "Not Started",
        tasks: [
          { text: "Final walk-through prior to Council EHO audit", done: false },
          { text: "Verify documentation on-site", done: false },
        ],
      },
    ],
  },
];

export const INITIAL_PROPOSALS = [
  {
    id: "prop_1",
    clientId: "cli_1",
    clientName: "Jonathan Montao",
    businessName: "Montao Quality Bakery",
    industryId: "home",
    industry: "Home-Based Food Business",
    lga: "Blacktown",
    email: "jonathan@montaobakery.com.au",
    address: "123 Market Street, Blacktown NSW 2148",
    status: "Sent",
    createdAt: "2026-08-08",
    snapshot: null,
  },
];

export const INITIAL_LEADS = [
  {
    id: "lead_1",
    name: "Sarah Chen",
    businessName: "Chen's Dumpling House",
    phone: "0421 222 333",
    email: "sarah@chendumplings.com.au",
    industry: "Restaurant / Café / Takeaway",
    source: "Website",
    status: "Qualified",
    notes: "Opening a new dine-in venue in Chatswood — enquired about full FSP build + council pathway.",
    createdDate: "2026-08-05",
  },
  {
    id: "lead_2",
    name: "Daniel Nguyen",
    businessName: "Nguyen's Catering Co",
    phone: "0433 444 555",
    email: "daniel@nguyenscatering.com.au",
    industry: "Catering Operations",
    source: "Referral",
    status: "New",
    notes: "Expanding into high-volume event catering; needs HACCP program and FSS pathway.",
    createdDate: "2026-08-10",
  },
];

export const INITIAL_EXPENSES = [
  {
    id: "exp_1",
    date: "2026-08-03",
    category: "Travel",
    description: "Fuel — site visits (Blacktown, Parramatta)",
    amount: 86.4,
    gstIncluded: true,
    paymentMethod: "Credit Card",
    reimbursable: false,
    note: "",
    receiptName: null,
    receiptData: null,
  },
  {
    id: "exp_2",
    date: "2026-08-06",
    category: "Professional Services",
    description: "Food Safety Supervisor course refresher",
    amount: 220.0,
    gstIncluded: true,
    paymentMethod: "Credit Card",
    reimbursable: false,
    note: "",
    receiptName: null,
    receiptData: null,
  },
];

export const INITIAL_KM_ENTRIES = [
  {
    id: "km_1",
    date: "2026-08-03",
    odometerStart: 48210,
    odometerEnd: 48394,
    destination: "Montao Quality Bakery, 123 Market Street Blacktown NSW",
    reason: "Site gap assessment — Phase 1",
    tolls: 0,
    note: "",
  },
];

export const INITIAL_RECURRING = [
  { id: "rec_1", title: "Food Safety Supervisor (FSS) Renewal", category: "Certification", frequency: "5 Yearly", lastRenewed: "2022-03-15", nextDue: "2027-03-15", notes: "Requires refresher unit within 12 months of expiry.", completed: false },
  { id: "rec_2", title: "Annual Food Safety Program Review", category: "Audit", frequency: "Annual", lastRenewed: "2026-02-20", nextDue: "2027-02-20", notes: "Review & update client FSPs.", completed: false },
  { id: "rec_3", title: "NSW Food Authority Licence Renewal", category: "Licence", frequency: "Annual", lastRenewed: "2025-11-10", nextDue: "2026-11-10", notes: "", completed: false },
  { id: "rec_4", title: "Professional Indemnity Insurance Renewal", category: "Insurance", frequency: "Annual", lastRenewed: "2026-07-01", nextDue: "2027-07-01", notes: "PI + public liability, $1m cover.", completed: false },
];

export const INITIAL_SETTINGS = {
  businessName: "AMES Food Advisory",
  abn: "61 136 364 150",
  phone: "(02) 7822 0109",
  email: "ames.food.adv@gmail.com",
  website: "amesfoodadvisory.com.au",
  address: "Sydney NSW",
  tagline: "Sydney & NSW Food Safety Compliance Specialists",
  signature: "AMES Food Advisory — Ann-Marie Skarmoutsos",
  invoiceTerms: "Standard terms: payment due 14 days from invoice date. 50% deposit applies to commence engagement, balance on delivery of final documentation.",
  gstRate: 10,
};
