"use client";
import { useCallback, useEffect, useState } from "react";

// Saqlangan maskanlar — hozircha brauzerda. Backend ulanganda foydalanuvchi profiliga ko'chiriladi.
const KEY = "saved-resorts";

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(read()), []);

  const toggle = useCallback((id: string) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    setIds(next);
  }, []);

  return { ids, isSaved: (id: string) => ids.includes(id), toggle };
}
