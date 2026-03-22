import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, apiRequest } from "./api";

/**
 * Panelde bekleyen garson çağrılarını SSE ile günceller; bağlantı kopsa bile periyodik yeniler.
 */
export function useWaiterCallsStream() {
  const [calls, setCalls] = useState([]);
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest("/restaurant/waiter-calls/pending");
      setCalls(Array.isArray(data.calls) ? data.calls : []);
    } catch {
      /* sessiz */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh();

    const token = localStorage.getItem("token");
    if (!token) {
      return undefined;
    }

    const url = `${API_BASE_URL}/restaurant/waiter-calls/events?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onopen = () => {
      if (!cancelled) {
        setConnected(true);
      }
    };
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "snapshot" && Array.isArray(msg.calls)) {
          setCalls(msg.calls);
        }
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      setConnected(false);
    };

    const poll = setInterval(() => {
      refresh();
    }, 15000);

    return () => {
      cancelled = true;
      es.close();
      clearInterval(poll);
    };
  }, [refresh]);

  return { calls, connected, refresh };
}
