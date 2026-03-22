import { useEffect } from "react";

/**
 * Silme / riskli işlemler için onay penceresi.
 */
export default function ConfirmModal({
  open,
  title = "Emin misiniz?",
  message,
  confirmLabel = "Evet, sil",
  cancelLabel = "Vazgeç",
  onConfirm,
  onCancel,
  loading = false,
  danger = true
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onKeyDown(e) {
      if (e.key === "Escape" && !loading) {
        onCancel?.();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel, loading]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        aria-label="Kapat"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
        disabled={loading}
        onClick={() => !loading && onCancel?.()}
        type="button"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {message ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            }`}
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? "Siliniyor…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
