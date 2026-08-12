import { useEffect, useRef, useState, useCallback } from "react";
import { isSupabaseConfigured, getSyncStatus, pushCollections, pullCollections } from "../lib/sync";

export default function useCloudSync(store, applyRemote) {
  const [status, setStatus] = useState({ configured: isSupabaseConfigured(), syncing: false, lastSyncAt: null, lastResult: null });

  const refreshStatus = useCallback(async () => {
    const s = await getSyncStatus();
    setStatus((prev) => ({ ...prev, configured: s.configured, lastSyncAt: s.lastSyncAt }));
  }, []);

  const pushNow = useCallback(async () => {
    setStatus((prev) => ({ ...prev, syncing: true }));
    const res = await pushCollections(store);
    setStatus((prev) => ({ ...prev, syncing: false, lastSyncAt: res.ok ? new Date().toISOString() : prev.lastSyncAt, lastResult: res }));
    return res;
  }, [store]);

  const pullNow = useCallback(async () => {
    setStatus((prev) => ({ ...prev, syncing: true }));
    const res = await pullCollections();
    if (res.ok && applyRemote) applyRemote(res.data);
    setStatus((prev) => ({ ...prev, syncing: false, lastSyncAt: res.ok ? new Date().toISOString() : prev.lastSyncAt, lastResult: res }));
    return res;
  }, [applyRemote]);

  useEffect(() => {
    refreshStatus();
    if (isSupabaseConfigured() && applyRemote) {
      pullNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!isSupabaseConfigured()) return;
    const t = setTimeout(() => pushCollections(store), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  return { status, pushNow, pullNow, refreshStatus };
}
