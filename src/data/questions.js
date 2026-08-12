// Base question bank for the AMES Scoping Questionnaire & Question Studio.
// Research-backed against NSW Food Authority / Food Standards Code / local
// council requirements (Standard 3.2.1, 3.2.2, 3.2.2A, 3.2.3, 3.3.1 & NSW Food Regulation).
// Question shape: { id, q, type: "select"|"multiselect"|"yesno"|"date", options?: [], cat?: "" }

export const BASE_QUESTIONS = {
  restaurant: [
    { id: "r1", q: "Cooking methods used", type: "multiselect", options: ["Grill", "Deep fry", "Wok", "Tandoor / charcoal", "Steam", "Sous vide", "Convection / combi oven", "None of these"] },
    { id: "r2", q: "Rice-based / slow-cooked dish holding", type: "select", options: ["Not applicable", "Held / reheated under 2 hrs", "Held / reheated over 2 hrs", "Held on hot display / bain-marie", "Unsure"] },
    { id: "r3", q: "High-risk processes on menu", type: "multiselect", options: ["Fermentation", "Raw marination", "Sous vide", "Cook-chill", "Raw seafood service (sashimi/ceviche)", "None of these"] },
    { id: "r4", q: "Expected customer volume", type: "select", options: ["Café — under 50 covers/day", "Mid — 50–150 covers/day", "High-turnover — 150–400 covers/day", "Very high — 400+ covers/day"] },
    { id: "r5", q: "Service type", type: "multiselect", options: ["Dine-in", "Takeaway", "Delivery (third-party app)", "Delivery (own fleet)", "Catering", "Late night service"] },
    { id: "r6", q: "Desserts / ice cream needing temperature control", type: "yesno" },
    { id: "r7", q: "On-site prep of raw proteins (chicken, seafood, eggs)", type: "yesno" },
    { id: "r8", q: "Display & holding equipment in use", type: "multiselect", options: ["Cold display counter", "Hot bain-marie / hot hold", "Open deli display", "Blast chiller / rapid cooler", "None of these"] },
    { id: "r9", q: "Typical time food is out of temperature control on delivery", type: "select", options: ["Under 30 minutes", "30–60 minutes", "Over 60 minutes", "No delivery — dine-in only"] },
    { id: "r10", q: "Commercial exhaust canopy installed above cooking", type: "yesno" },
    { id: "r11", q: "Dedicated hand-washing basin with warm water, soap & single-use towels near food prep", type: "yesno" },
    { id: "r12", q: "Menu complexity", type: "select", options: ["Simple — under 15 items", "Moderate — 15–40 items", "Complex — 40+ items", "Large shared / banquet menu"] },
  ],
  manufacturer: [
    { id: "m1", q: "Food categories produced", type: "multiselect", options: ["Meat & poultry", "Dairy", "Seafood", "Eggs", "Plant-based", "Baked goods", "Confectionery", "Beverages", "Sauces / condiments", "Snack foods", "Acid-preserved (jams, chutneys, pickles)", "Nut & coffee roasting"] },
    { id: "m2", q: "Distribution channels", type: "multiselect", options: ["Direct to consumer", "Wholesale", "Interstate", "Export", "Food service / hospitality", "Retail shelf"] },
    { id: "m3", q: "NSW Food Authority licence status", type: "select", options: ["Already licensed", "Application in progress", "Not started", "Unsure if required", "Licence not required — council notification"] },
    { id: "m4", q: "Production scale", type: "select", options: ["Small batch", "Medium volume", "Large / multi-shift", "Contract / co-packing for other brands"] },
    { id: "m5", q: "Existing HACCP plan or food safety program", type: "yesno" },
    { id: "m6", q: "Co-packing / private label manufacturing", type: "yesno" },
    { id: "m7", q: "GFSI certification support needed (SQF, HARPS, BRC)", type: "yesno" },
    { id: "m8", q: "HACCP prerequisite programs in place", type: "multiselect", options: ["Cleaning & sanitation", "Pest control", "Supplier approval", "Recall & traceability", "Staff training", "Equipment maintenance & calibration", "Water / air quality", "None in place yet"] },
    { id: "m9", q: "Finished product storage", type: "select", options: ["Ambient / shelf-stable", "Refrigerated", "Frozen", "Mixed storage"] },
    { id: "m10", q: "Raw material risk profile", type: "multiselect", options: ["Raw meat / poultry", "Raw milk / dairy", "Shellfish", "Ready-to-eat (RTE) handling", "None — ambient ingredients only"] },
    { id: "m11", q: "Imported food ingredients used", type: "yesno" },
    { id: "m12", q: "Microbiological testing arrangements", type: "select", options: ["External NATA-accredited lab", "In-house rapid testing", "No testing yet", "Not required for our category"] },
  ],
  catering: [
    { id: "c1", q: "Kitchen setup", type: "select", options: ["Fixed commercial kitchen", "Transported / finished on-site", "Both — base kitchen + offsite service", "Registered home-based kitchen"] },
    { id: "c2", q: "Typical event size", type: "select", options: ["Small — under 50 pax", "Medium — 50–200 pax", "Large — 200–500 pax", "Very large — 500+ pax"] },
    { id: "c3", q: "Transport temperature control", type: "select", options: ["Active refrigeration / heating", "Insulated / passive only", "Time-based control (2 hr / 4 hr rule)", "Unsure / none yet"] },
    { id: "c4", q: "High-risk items on standard menus", type: "multiselect", options: ["Seafood", "Raw egg products", "Dairy desserts", "Cooked meats / poultry", "Sauces & gravies", "Rice dishes", "None of these"] },
    { id: "c5", q: "Caters for vulnerable groups (aged care, children, hospitals)", type: "yesno" },
    { id: "c6", q: "Service model", type: "select", options: ["Plated service", "Buffet / self-serve", "Food stations", "Drop-off / boxed catering", "Hybrid"] },
    { id: "c7", q: "On-site holding equipment", type: "multiselect", options: ["Bain-marie / hot hold", "Refrigerated service line", "Blast chiller", "Portable warmers / coolers", "None of these"] },
    { id: "c8", q: "Typical transport distance", type: "select", options: ["Under 20 km", "20–60 km", "60+ km", "Multi-site deliveries per event"] },
    { id: "c9", q: "Food prepared in advance over 24 hours (cook-chill / cook-freeze)", type: "yesno" },
  ],
  vulnerable: [
    { id: "v1", q: "Facility type", type: "select", options: ["Childcare / early learning", "Aged care facility", "Hospital", "Hospice / palliative care", "Respite care", "Delivered meals organisation"] },
    { id: "v2", q: "Meals served per day", type: "select", options: ["Under 50", "50–150", "150–300", "300+"] },
    { id: "v3", q: "Food preparation location", type: "select", options: ["On-site", "External caterer", "Both"] },
    { id: "v4", q: "Individual dietary / allergy tracking process", type: "select", options: ["Formal system in place", "Informal / paper-based", "No process yet"] },
    { id: "v5", q: "Dietitian-signed-off menu review", type: "yesno" },
    { id: "v6", q: "Temperature logging method", type: "select", options: ["Digital / automated", "Manual logs", "No process yet"] },
    { id: "v7", q: "NSW Food Authority vulnerable persons licence status", type: "select", options: ["Already licensed", "Licence application in progress", "Not started", "Childcare — NSWFA licence not required", "Unsure if licensed"] },
    { id: "v8", q: "Special & modified diets catered for", type: "multiselect", options: ["Texture-modified (minced / pureed)", "Gluten-free", "Dairy-free", "Low sodium", "Diabetic", "Nil-by-mouth / fluid-only", "None of these"] },
    { id: "v9", q: "Cook-chill / cook-freeze production used", type: "yesno" },
    { id: "v10", q: "Control of food brought into the facility by families / visitors", type: "select", options: ["Not permitted", "Informal policy", "Formal written policy & control"] },
  ],
  home: [
    { id: "h1", q: "Council has confirmed home-based food business is permitted at this address (zoning / DA / CDC)", type: "yesno" },
    { id: "h2", q: "Product types produced", type: "multiselect", options: ["Potentially hazardous (needs refrigeration)", "Shelf-stable", "Frozen", "Acid-preserved (jams, preserves, pickles)", "Fermented products", "Baked goods", "Confectionery"] },
    { id: "h3", q: "Sales channels", type: "multiselect", options: ["Markets", "Online / e-commerce", "Wholesale to other retailers", "Community / event stalls", "Direct to café / restaurant (on-sell)"] },
    { id: "h4", q: "Separate storage for business vs household food", type: "yesno" },
    { id: "h5", q: "Shared use of domestic kitchen equipment for production", type: "yesno" },
    { id: "h6", q: "Typical weekly production volume", type: "select", options: ["Under 20 items", "20–100 items", "100–300 items", "300+ items"] },
    { id: "h7", q: "Notification pathway", type: "select", options: ["Sell direct to public — notify council", "Sell to businesses to on-sell — notify NSW Food Authority", "Already notified", "Unsure"] },
    { id: "h8", q: "Home kitchen / prep area arrangement", type: "select", options: ["Fully dedicated to the business", "Part-time dedicated area", "Shared with household cooking"] },
    { id: "h9", q: "Delivery method", type: "select", options: ["Customer pickup", "Local delivery only", "Courier / posted", "Multiple methods"] },
    { id: "h10", q: "Pets / animals kept away from food preparation and storage areas", type: "yesno" },
  ],
  rto: [
    { id: "t1", q: "Units of competency being delivered", type: "multiselect", options: ["SITXFSA005", "SITXFSA006", "SIRRFSA001", "HLTFSE001", "HLTFSE005", "HLTFSE007", "FBPFSY1002", "FBPFSY2002"] },
    { id: "t2", q: "What is needed from AMES", type: "select", options: ["Deliver training directly", "Review / build training materials", "Both", "Assessment tools only"] },
    { id: "t3", q: "Cohort size and delivery mode", type: "select", options: ["Small — under 10, in-person", "Large — 10+, in-person", "Blended delivery", "Fully online"] },
    { id: "t4", q: "Face-to-face practical assessment support needed", type: "yesno" },
    { id: "t5", q: "RTO registration status", type: "select", options: ["Registered RTO (ASQA)", "RTO application in progress", "Partner / third-party provider", "Not an RTO yet"] },
    { id: "t6", q: "Trainer credentials", type: "select", options: ["Qualified trainers with current competencies", "Need trainer upskilling", "Mix of both"] },
    { id: "t7", q: "Assessment tools status", type: "select", options: ["Existing tools to review", "Need new assessment tools built", "Both"] },
  ],
  core: [
    { id: "core1", q: "Registration status with council / NSW Food Authority", type: "select", options: ["Not started", "In progress", "Already registered", "Not sure"] },
    { id: "core2", q: "Council / LGA", type: "select", options: ["Parramatta", "Sutherland Shire", "City of Sydney", "Inner West", "Cumberland", "Blacktown", "Canterbury-Bankstown", "Penrith", "Liverpool", "Northern Beaches", "Wollongong", "Newcastle", "Other Western Sydney", "Outside Greater Sydney", "Not sure"] },
    { id: "core3", q: "Business structure", type: "select", options: ["Sole trader", "Partnership", "Company", "Trust", "Not-for-profit / charity"] },
    { id: "core4", q: "Decision-maker / budget holder present on this call", type: "yesno" },
    { id: "core5", q: "Food Safety Supervisor status", type: "select", options: ["Have certified FSS", "Need training", "Unsure", "FSS not required for our activities"] },
    { id: "core6", q: "Total staff needing food safety training", type: "select", options: ["1–4", "5–9", "10–19", "20+"] },
    { id: "core7", q: "Existing Food Safety Program / SOPs", type: "select", options: ["None — from scratch", "Partial / informal", "Full docs to review"] },
    { id: "core8", q: "Site / expansion plan", type: "select", options: ["Single site only", "Considering multiple sites", "Franchise plan"] },
    { id: "core9", q: "Prior food business operating experience", type: "yesno" },
    { id: "core10", q: "Target opening / start date", type: "date" },
    { id: "core11", q: "Expected weekly meals / covers served", type: "select", options: ["Under 50", "50–150", "150–400", "400+"] },
    { id: "core12", q: "Primary sale channels", type: "multiselect", options: ["Dine-in / direct retail", "Wholesale / on-sell", "Online delivery", "Markets / events", "Multiple channels"] },
  ],
  practices: [
    { id: "p1", cat: "Temperature control", q: "Fridge / freezer / hot-holding monitoring & recording", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p2", cat: "Temperature control", q: "Cooling process for cooked food before storage", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p3", cat: "Temperature control", q: "Incoming stock temperature checks at receival", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p4", cat: "Allergen management", q: "Allergen declarations & customer allergy-request process", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p5", cat: "Allergen management", q: "Cross-contact prevention in prep (shared equipment, oils, storage)", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p6", cat: "Cleaning & sanitation", q: "Cleaning schedule", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p7", cat: "Cleaning & sanitation", q: "Cleaning / sanitising verification & records", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p8", cat: "Pest control", q: "Pest control contractor", type: "select", options: ["Confirmed", "Needs sourcing", "Not applicable"] },
    { id: "p9", cat: "Supplier control", q: "Supplier food safety cert checks", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p10", cat: "Supplier control", q: "Recall / traceability process", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p11", cat: "Staff hygiene", q: "Hygiene training beyond FSS (handwashing, illness reporting, PPE)", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p12", cat: "Cross-contamination", q: "Raw meat / poultry vs ready-to-eat prep separation", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p13", cat: "Cleaning & sanitation", q: "Dishwasher sanitising temperature / chemical verification", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p14", cat: "Premises & waste", q: "Waste management & bin storage controls", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p15", cat: "Premises & waste", q: "Hand-washing facility adequacy (warm water, soap, single-use towels)", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p16", cat: "Equipment", q: "Repair & maintenance of refrigeration, cooking & canopy equipment", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
    { id: "p17", cat: "Staff hygiene", q: "Food handler training records maintained for all staff", type: "select", options: ["In place", "Partial", "Needs building", "Not applicable"] },
  ],
};

export function buildDefaultQuestionsData() {
  return JSON.parse(JSON.stringify(BASE_QUESTIONS));
}

// Merge saved (possibly older / custom-only) studio data over the base bank so
// default questions always populate while preserving user-added custom questions.
export function mergeQuestionsWithBase(saved) {
  const merged = {};
  for (const key of Object.keys(BASE_QUESTIONS)) {
    const baseList = BASE_QUESTIONS[key] || [];
    const savedList = Array.isArray(saved[key]) ? saved[key] : [];
    const savedIds = new Set(savedList.map((q) => q.id).filter(Boolean));
    const baseOnly = baseList.filter((q) => !savedIds.has(q.id));
    merged[key] = [...baseOnly, ...savedList];
  }
  for (const key of Object.keys(saved)) {
    if (!merged[key]) merged[key] = saved[key];
  }
  return merged;
}
