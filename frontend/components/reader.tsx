"use client";
import { useEffect, useState } from "react";

export function useRead<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    setData(undefined);
    setError("");
    async function refresh() {
      try {
        const next = await load();
        if (active) {
          setData(next);
          setError("");
        }
      } catch (e) {
        if (active) {
          setData(undefined);
          setError(e instanceof Error ? e.message : "Read failed.");
        }
      }
      if (active) timer = setTimeout(refresh, 30000);
    }
    void refresh();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [load]);
  return { data, error };
}
export function useClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const token = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(token);
  }, []);
  return now;
}
export function Notice({
  error,
  loading = "Reading Studionet…",
}: {
  error: string;
  loading?: string;
}) {
  return (
    <p role="status" className="notice">
      {error || loading}
    </p>
  );
}
