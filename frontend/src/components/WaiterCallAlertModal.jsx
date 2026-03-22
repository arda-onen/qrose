/**
 * Yeni garson çağrısında dikkat çekmek için tam ekran hafif karartma + vurgulu kart.
 */
export default function WaiterCallAlertModal({ open, tableLabels, onDismiss }) {
  if (!open || !tableLabels?.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
      <button
        aria-label="Kapat"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onDismiss}
        type="button"
      />
      <div
        className="relative z-10 w-full max-w-md"
        role="dialog"
        aria-labelledby="waiter-alert-title"
        aria-modal="true"
      >
        <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-50 to-amber-100/95 p-6 shadow-2xl ring-4 ring-amber-300/40">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
              <svg aria-hidden className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Yeni çağrı</p>
              <h2 className="mt-1 text-xl font-bold text-amber-950" id="waiter-alert-title">
                Garson isteniyor
              </h2>
              <ul className="mt-3 space-y-1.5">
                {tableLabels.map((label, idx) => (
                  <li
                    className="rounded-lg bg-white/90 px-3 py-2 text-base font-semibold text-slate-900 shadow-sm"
                    key={`${label}-${idx}`}
                  >
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-amber-900/90">
                Müşteri menüden garson çağırdı. Masayı kontrol edin.
              </p>
            </div>
          </div>
          <button
            className="mt-6 w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-700"
            onClick={onDismiss}
            type="button"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}
