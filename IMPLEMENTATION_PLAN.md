# AMES Food Advisory — Client & Job Portal Build Plan

Reference: Sydney Automation Co Job System (https://sydneyautomationco-job-system.vercel.app/)
Goal: rebuild the AMES qualification app to the same product depth & polish, keeping the AMES brand.

## Locked Decisions
- **Visual**: Re-skin the app to the **real AMES website palette** (navy + amber), not the current green/tan. Adopt the reference app's design language (dark sidebar, stat cards, chips, filter tabs, toasts, modern components).
- **Documents (proposals + invoices)**: match the AMES **website header + logo**, and *kind of* match the **Jonathan proposal example** (structure + "OFFICIAL" navy document look).
- **Fix**: the existing Tax Invoice Generator is broken in the portal — rebuild it as part of the invoice work.
- **Scope**: Core operations first (Milestone 1), then add-ons (Milestone 2).
- **Backend**: Single-user, localStorage-first + Supabase push/pull sync (mirrors the reference; no login screen).
- **AI**: Skipped for now (no chat panel in this build).

## Brand & Document Design Spec (from amesfoodadvisory.com.au + Jonathan example)

### Website palette (source of truth for app UI)
- `--navy: #1C2B3A` (primary brand), `--navy-deep: #131E28`, `--navy-mid: #243548`, `--navy-lift: #2E4460`
- `--amber: #D4751F` (accent), `--amber-dim: #B05E10`, `--amber-pale: #FEF3E8`
- `--stone: #F5F1EB`, `--stone-mid: #EDE7DE`, `--stone-dark: #DDD4C6` (warm neutrals / card bg)
- `--ink: #1A1C1E`, `--ink-mid: #3C4048`, `--ink-soft: #6B7280`, `--ink-muted: #9CA3AF`
- Success: `#1A6B3A` (with pale `#EAF5EE`), warning amber tones, danger `#8A2A1A` (pale `#FEF0EC`)
- Fonts: **Playfair Display** (headings / `.brand-font`) + **Inter** (body/UI); DM Mono-style mono for job/invoice numbers optional

### Website header + logo (reuse on invoices, proposals, and app sidebar)
- Header band: deep navy `#131E28` / `#1C2B3A`, white text.
- Logo lockup: `AMES` in white Playfair Display bold + `Food Advisory` in **italic amber `#D4751F`**; below it tiny tagline `NSW · HACCP · FOOD CONSULTANTS` (uppercase, letter-spaced, `rgba(255,255,255,0.30)`).
- Contact strip on website header: phone `(02) 7822 0109` + "Book Call" CTA (navy/amber buttons).

### Jonathan proposal example (5-page PDF — structural template for proposals AND invoices)
- Colors: dark navy `#1F3864`, blue `#156082`, `#2E74B5`, gold accent `#B08D57`.
- Each page header: `AMES FOOD ADVISORY` (left), `AMES Food Advisory | Confidential Proposal | Page N`; prominent `OFFICIAL` label/band.
- Title block: `OFFICIAL PROPOSAL`, program title (e.g. "Food Business Compliance & Council Approval Readiness Program"), `Prepared by: AMES Food Advisory`, Date.
- Body sections: 1. Executive Summary → 2. Background & Objective → 3. Scope of Services (4 phases, bulleted) → 4. Why This Approach Reduces Timeframes → 5. Indicative Timeline (table) → 6. Deliverables → 7. Indicative Fees (table; Phase 1 $654.50 incl GST, others TBA, bundled total) → 8. Next Steps.
- Footer: `AMES Food Advisory — Ann-Marie Skarmoutsos | amesfoodadvisory.com.au`.

---

## Milestone 0 — Design System Upgrade
Adopt the reference's design language while preserving the AMES palette.

**Files:** `src/index.css`, `index.html`, `src/components/Sidebar.jsx`, new `src/components/common/*`

1. **Design tokens** in `index.css`: replace green/tan with the website navy/amber palette (`--navy`, `--amber`, `--stone`, `--ink`, success/danger, radius, shadows).
2. **Component CSS classes** mirroring the reference: `.card`, `.btn-*`, `.stat-card`, `.chip`, `.filter-tab`, `.search-bar`, `.data-table`, `.section-card`, `.page-header`, `.empty-state`, `.gradient-accent`.
3. **Fonts**: Playfair Display (headings, replaces `.brand-font` Georgia) + Inter (UI) via Google Fonts `<link>` in `index.html`; DM Mono optional for job/invoice numbers.
4. **Shared components** in `src/components/common/`: `StatCard`, `Chip`, `FilterTabs`, `SearchBar`, `Modal`, `EmptyState`, `PageHeader`, `AMESLogo` (navy/amber lockup + tagline), `Toasts` (global toast provider + `useToast`/`toast()` helper).
5. **Sidebar redesign**: navy `#131E28` panel, AMES logo lockup at top, nav sections with labels, dynamic badges (overdue, active jobs, quotes awaiting, leads), active-item amber accent bar, "New Qualification" quick action retained.
6. **Print stylesheet** for branded docs (quotes, invoices, service reports) via `.no-print` + `print-color-adjust: exact`.

**Verify:** `npm run build` + `npm run lint` (0 errors); visual pass on Dashboard/CRM/Questionnaire/JobBoard/Invoices.

---

## Milestone 1 — Core Operations

### M1.1 Dashboard (rewrite `src/components/Dashboard.jsx`)
Reference-style operational cockpit:
- Stat cards: Active Qualifications, Outstanding $ (invoices), Overdue, Active Jobs, Total Clients.
- Upcoming site audits strip (scheduled jobs from Calendar data) with TODAY/SOON day chips.
- Needs Attention list: quotes/proposals awaiting acceptance, overdue invoices, FSS-expiry alerts.
- Active jobs pipeline with per-job progress bars (existing data), recent clients list.
- Alert banners for overdue tiers (friendly → formal) — recoloured to AMES palette.

### M1.2 Client CRM (extend `src/components/ClientCRM.jsx`)
- Keep CRUD + search; add industry filter tabs with counts, status chips.
- Client detail: pricing tier, system-type chips (industry), LGA, notes, linked jobs/invoices.
- "Scope this client" button → Questionnaire (exists).

### M1.3 Qualification Portal (`Questionnaire.jsx`) + Question Studio
- Restyle to new design system (step wizard, chips, custom-answer inputs stay).
- No functional change to base question bank / merge logic.

### M1.4 Proposal Generator (`ProposalViewer.jsx`)
- Rebuild the document to match the **Jonathan example structure** (OFFICIAL PROPOSAL title block, 8 numbered sections, phase scope/timeline/fees tables) using the website **navy/amber header + logo lockup**.
- Keep include/exclude phases, editable titles/prices/deliverables, GST calc, DOCX export, template save/load.
- Add print/PDF service (window.print + print stylesheet) as a second export path.
- Proposal lifecycle status: Draft → Sent → Approved → Lost; "Approve & Launch Job" transitions client/job status.

### M1.5 Job Management (extend `src/components/JobBoard.jsx`)
- Job numbers `AFA-J####` (auto-increment, DM Mono).
- Status pipeline per job with next-step action buttons (e.g. Advance Phase, Mark Delivered) + revert.
- Invoice lines editor, variations, attachments (base64 localStorage), activity log per job.
- Scheduled date/time on jobs → feeds Dashboard + Calendar.

### M1.6 Tax Invoices (REBUILD `src/components/InvoiceGenerator.jsx`)
- **Fix the broken generator**: recreate/create/save/edit/delete/mark-Paid flow, robust against legacy invoices missing `lineItems`, empty invoice lists, and null `clients[0]`.
- Re-skin the invoice document to the website header + logo (navy band, AMES lockup, tagline) and Jonathan-example layout (OFFICIAL, bill-to block, navy table header, totals panel, footer).
- Keep AFA-####### auto-increment, GST, CRM-link prefill.
- Invoice lifecycle: Unpaid → Paid (with paid-date), aged-debtor view, "Chase" copy-to-clipboard email template.
- Print/PDF invoice (print stylesheet so only the document prints, not the sidebar).

### M1.7 Calendar (new `src/components/Calendar.jsx`)
- Month/week/agenda views of scheduled jobs (site audits, mock EHO inspections).
- Click a day → schedule/unschedule a job; day chips flow to Dashboard.

### M1.8 Leads (new `src/components/Leads.jsx`)
- Enquiry intake: name, business, phone, email, industry, source, notes.
- Status: New → Contacted → Qualified → Converted → Lost.
- "Convert to Client" button creates a CRM record and links it.
- Badge on sidebar.

**Milestone 1 wiring:** update `App.jsx` nav + state (`leads`, job scheduling, invoice lifecycle, proposal status). Data stays localStorage (`ames_*` keys). Sidebar gains Leads + Calendar.

**Verify:** build + lint clean; full user flow works: Lead → Client → Questionnaire → Proposal → Approve → Job → Schedule → Invoice → Paid.

---

## Milestone 2 — Add-Ons & Cloud Sync

### M2.1 Infrastructure
- GitHub repo init (`.gitignore`, `README`), Vercel deploy config.
- Supabase project: tables `clients`, `jobs`, `invoices`, `proposals`, `leads`, `settings` (single-user, no RLS/auth), seed matching `initialData`.
- `npm i @supabase/supabase-js xlsx` (+ `recharts` for Financials charts).
- `src/lib/supabaseClient.js` (env vars in `.env`), `src/hooks/useCloudSync.js`.

### M2.2 Sync engine
- Mirror the reference: localStorage-first, cloud push on change, pull on load, 5-min auto-save, `savedAt` last-write-wins per table, backup/restore JSON export, manual push/pull + status in Settings.

### M2.3 Financials (new)
- Revenue by FY, take-home (revenue − costs), pipeline coverage, quote conversion rate, GST collected estimate, Xero CSV export, bar/donut charts (recharts).

### M2.4 Expenses (new)
- Categorized entries, tax categories, payment method, reimbursable flag, receipts (base64), monthly totals.

### M2.5 Km Log (new)
- Odometer-based log for site visits, ATO rate, tolls, Google Maps link, monthly claim estimate.

### M2.6 Tax Summary / BAS (new)
- GST collected vs paid estimate, quarterly BAS view, FY figures — reference-style tax page.

### M2.7 Recurring Compliance (new)
- Recurring items: FSS renewal (5yr), annual FSP review, NSWFA licence renewal, annual council re-registration. Auto-due date reminders feeding Dashboard "Needs Attention".

### M2.8 Settings (new)
- Business profile, pricing catalog editor (seeds `pricingCatalog`), quote/invoice terms, proposal templates, Supabase sync config + status, full backup/restore, **Excel/CSV import** (clients & leads via SheetJS).

### M2.9 Mobile polish
- Fixed mobile bottom nav (Field, Dash, Jobs, Leads, More), responsive grids, bottom-sheet modals — reference-style.

**Verify:** build + lint clean; sync push/pull round-trip tested; Excel import tested; all new modules lint-clean.

---

## Deferred / Out of Scope
- AI assistant panel (chat, quick actions, business-context prompts) — revisit later per decision.
- Payroll, Parts inventory, Agents inbox, Comms center — not relevant to a solo food-safety advisory.

## Cross-Cutting Rules
- AMES brand = website navy `#1C2B3A` / `#131E28` + amber `#D4751F`, Playfair Display headings, Inter body. Proposal/invoice documents use the website header + logo and Jonathan-example "OFFICIAL" layout.
- Official pricing stays sourced from `src/data/pricingCatalog.js` (595/600/800/1500/250/450 ex GST); proposal fee table matches Jonathan example format (Phase 1 fixed, others TBA, bundled total).
- Questions stay in `src/data/questions.js` (base bank + merge logic unchanged).
- Lint must stay 0 errors; clean unused imports as files are touched.
