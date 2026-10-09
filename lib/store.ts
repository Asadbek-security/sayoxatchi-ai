"use client";
import { useCallback, useEffect, useState } from "react";

// Brauzerda saqlanadigan kichik ro‘yxatlar (saqlangan, yaqinda ko‘rilgan, solishtirish).
// Backend ulanganda "saqlangan" foydalanuvchi profiliga ko‘chiriladi.
const EVT = "sayoxatchi-store";

function read(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function write(key: string, v: string[]) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

function useStoredList(key: string) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read(key));
    const on = (e: Event) => { if ((e as CustomEvent).detail === key) setIds(read(key)); };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, [key]);
  return ids;
}

export function useSaved() {
  const ids = useStoredList("saved-resorts");
  const toggle = useCallback((id: string) => {
    const cur = read("saved-resorts");
    write("saved-resorts", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, []);
  return { ids, isSaved: (id: string) => ids.includes(id), toggle };
}

export function useRecent() {
  const ids = useStoredList("recent-resorts");
  const push = useCallback((id: string) => {
    write("recent-resorts", [id, ...read("recent-resorts").filter((x) => x !== id)].slice(0, 6));
  }, []);
  const clear = useCallback(() => write("recent-resorts", []), []);
  return { ids, push, clear };
}

export const COMPARE_MAX = 3;
export function useCompare() {
  const ids = useStoredList("compare-resorts");
  const toggle = useCallback((id: string) => {
    const cur = read("compare-resorts");
    if (cur.includes(id)) write("compare-resorts", cur.filter((x) => x !== id));
    else if (cur.length < COMPARE_MAX) write("compare-resorts", [...cur, id]);
  }, []);
  const clear = useCallback(() => write("compare-resorts", []), []);
  return { ids, has: (id: string) => ids.includes(id), toggle, clear, full: ids.length >= COMPARE_MAX };
}
