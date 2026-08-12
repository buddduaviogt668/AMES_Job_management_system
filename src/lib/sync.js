import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => Boolean(url && key);

let client = null;
export const getSupabase = () => {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createClient(url, key);
  return client;
};

export const COLLECTIONS = [
  "clients",
  "jobs",
  "invoices",
  "proposals",
  "leads",
  "expenses",
  "kmEntries",
  "recurringItems",
  "settings",
];

const metaKey = "ames_sync_meta";
const readMeta = () => {
  try {
    return JSON.parse(localStorage.getItem(metaKey)) || {};
  } catch {
    return {};
  }
};
const writeMeta = (meta) => localStorage.setItem(metaKey, JSON.stringify(meta));

export const getSyncStatus = async () => {
  const configured = isSupabaseConfigured();
  if (!configured) return { configured: false, lastSyncAt: null };
  try {
    const { data, error } = await getSupabase()
      .from("sync_state")
      .select("last_pull_at")
      .eq("id", 1)
      .single();
    if (error) throw error;
    const meta = readMeta();
    return {
      configured: true,
      lastSyncAt: (data && data.last_pull_at) || meta.lastPushAt || null,
    };
  } catch {
    const meta = readMeta();
    return { configured: true, lastSyncAt: meta.lastPushAt || null };
  }
};

const collectionPayload = (name, items) => ({ id: name, collection: name, payload: items, saved_at: new Date().toISOString() });

export const pushCollections = async (store) => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not-configured" };
  try {
    const rows = COLLECTIONS.filter((c) => store[c] !== undefined).map((c) => collectionPayload(c, store[c]));
    const { error } = await supabase.from("records").upsert(rows, { onConflict: "id" });
    if (error) throw error;
    const meta = readMeta();
    meta.lastPushAt = new Date().toISOString();
    writeMeta(meta);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String((err && err.message) || err) };
  }
};

export const pullCollections = async () => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not-configured", data: {} };
  try {
    const { data, error } = await supabase.from("records").select("id,payload,saved_at");
    if (error) throw error;
    const out = {};
    (data || []).forEach((row) => {
      out[row.id] = Array.isArray(row.payload) ? row.payload : [];
    });
    await supabase
      .from("sync_state")
      .upsert({ id: 1, last_pull_at: new Date().toISOString() }, { onConflict: "id" });
    return { ok: true, data: out };
  } catch (err) {
    return { ok: false, reason: String((err && err.message) || err), data: {} };
  }
};

export const downloadBackup = (store, filename) => {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), ...store }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `ames-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const parseBackup = (text) => {
  const parsed = JSON.parse(text);
  const out = {};
  COLLECTIONS.forEach((c) => {
    if (Array.isArray(parsed[c])) out[c] = parsed[c];
  });
  if (!Object.keys(out).length && Array.isArray(parsed.collections)) {
    Object.assign(out, parsed.collections);
  }
  return out;
};
