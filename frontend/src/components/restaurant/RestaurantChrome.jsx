import { Link } from "react-router-dom";
import { SkBlock } from "../skeletons/SkeletonPrimitives";

export function RestaurantPageShell({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-6xl space-y-8 pb-10 ${className}`}>{children}</div>;
}

export function PageBackLink({ to = "/restaurant", children = "Panele dön" }) {
  return (
    <Link
      className="group mb-1 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      to={to}
    >
      <svg
        aria-hidden
        className="h-4 w-4 transition group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
      {children}
    </Link>
  );
}

export function PageHeading({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {title ? (
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        ) : null}
        {description ? (
          <p
            className={`max-w-2xl text-sm leading-relaxed text-slate-600 ${title ? "mt-2" : ""}`}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Üst çubukta sayfa adı varken: sadece geri linki + kısa açıklama */
export function SubpageIntro({ backTo = "/restaurant", description, children }) {
  return (
    <div className="space-y-3 border-b border-slate-200/90 pb-6">
      <PageBackLink to={backTo} />
      {description ? <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p> : null}
      {children}
    </div>
  );
}

export function FlashBanner({ type = "error", children }) {
  const isError = type === "error";
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
        isError
          ? "border-red-200 bg-red-50/95 text-red-900"
          : "border-emerald-200 bg-emerald-50/95 text-emerald-900"
      }`}
      role={isError ? "alert" : "status"}
    >
      <span className={`mt-0.5 shrink-0 ${isError ? "text-red-500" : "text-emerald-500"}`} aria-hidden>
        {isError ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              fillRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              fillRule="evenodd"
            />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </div>
  );
}

/** @deprecated Tam sayfa için `Restaurant*Skeleton` bileşenlerini kullanın */
export function DashboardSpinner({ label = "Yükleniyor…" }) {
  return (
    <div
      className="rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-sm ring-1 ring-slate-900/[0.04]"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <div className="space-y-4">
        <SkBlock className="h-4 max-w-md" />
        <SkBlock className="h-32 w-full rounded-xl" />
        <div className="flex gap-2">
          <SkBlock className="h-9 flex-1 rounded-lg" />
          <SkBlock className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
