import { useState } from "react";
import { publicApiRequest } from "../lib/api";

/**
 * Sadece masa QR’si (?t=token) ile açıldığında gösterilir.
 */
export default function PublicCallWaiterFab({ slug, tableToken }) {
  const [phase, setPhase] = useState("idle");
  const [hint, setHint] = useState("");

  if (!tableToken) {
    return null;
  }

  async function onCall() {
    setPhase("sending");
    setHint("");
    try {
      await publicApiRequest(`/menu/${encodeURIComponent(slug)}/waiter-call`, {
        method: "POST",
        body: JSON.stringify({ tableToken })
      });
      setPhase("ok");
      setHint("Garson bilgilendirildi");
      setTimeout(() => {
        setPhase("idle");
        setHint("");
      }, 4500);
    } catch (e) {
      setPhase("err");
      setHint(e.message || "Gönderilemedi");
      setTimeout(() => {
        setPhase("idle");
        setHint("");
      }, 5000);
    }
  }

  const busy = phase === "sending";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
      <div className="pointer-events-auto flex max-w-sm flex-col items-end gap-2">
        {hint ? (
          <p
            className={`rounded-lg px-3 py-1.5 text-xs font-medium shadow-md ${
              phase === "err" ? "bg-red-600 text-white" : "bg-slate-900 text-white"
            }`}
            role="status"
          >
            {hint}
          </p>
        ) : null}
        <button
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-2 ring-white/20 transition hover:bg-slate-800 disabled:opacity-60"
          disabled={busy}
          onClick={onCall}
          type="button"
        >
          <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
            />
          </svg>
          {busy ? "Gönderiliyor…" : "Garson çağır"}
        </button>
      </div>
    </div>
  );
}
