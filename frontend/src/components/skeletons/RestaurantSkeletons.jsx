import { RestaurantPageShell } from "../restaurant/RestaurantChrome";
import { ui } from "../../lib/restaurantDashboardUi";
import { SkBlock, SkCircle, SkLine } from "./SkeletonPrimitives";

/** Panel özeti + kartlar + kategori tablosu */
export function RestaurantDashboardSkeleton() {
  return (
    <RestaurantPageShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <SkLine className="h-4 max-w-xl" />
          <SkLine className="h-3 max-w-lg opacity-80" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/[0.04]"
              key={i}
            >
              <div className="flex gap-4">
                <SkCircle className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2.5">
                  <SkLine className="h-5 w-28" />
                  <SkLine className="h-3 w-full max-w-[min(100%,280px)]" />
                  <SkLine className="h-3 w-20 opacity-90" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm ring-1 ring-slate-900/[0.04]"
              key={i}
            >
              <SkLine className="mb-3 h-2.5 w-24" />
              <SkBlock className="h-9 w-14 rounded-lg" />
            </div>
          ))}
        </div>

        <section>
          <SkLine className="mb-4 h-3 w-28" />
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
            <div className="flex gap-3 border-b border-slate-200/80 bg-slate-50/90 px-4 py-3">
              <SkLine className="h-3 flex-1" />
              <SkLine className="h-3 w-16" />
              <SkLine className="h-3 w-20" />
            </div>
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                className="flex items-center gap-4 border-b border-slate-100/90 px-4 py-3.5 last:border-0"
                key={row}
              >
                <SkBlock className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkLine className="h-4 w-[min(60%,220px)]" />
                  <SkLine className="h-3 w-[min(40%,140px)] opacity-85" />
                </div>
                <SkBlock className="h-8 w-20 shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </RestaurantPageShell>
  );
}

/** Arama + tablo */
export function RestaurantProductsSkeleton() {
  return (
    <RestaurantPageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <SkLine className="h-3 w-32" />
            <SkLine className="h-3 max-w-xl" />
            <SkLine className="h-3 max-w-lg opacity-80" />
          </div>
          <SkBlock className="h-11 w-36 shrink-0 rounded-xl" />
        </div>

        <div className={ui.productsSearchCard}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <SkBlock className="h-10 flex-1 rounded-lg" />
            <SkBlock className="h-4 w-24 shrink-0 rounded" />
          </div>
          <SkLine className="mt-2.5 h-3 max-w-md" />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="flex flex-wrap gap-2 border-b border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
              <SkLine className="h-3 w-14 sm:w-16" key={c} />
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
            <div
              className="flex items-center gap-2 border-b border-slate-100/90 px-2 py-2.5 last:border-0 md:gap-3 md:px-3"
              key={row}
            >
              <SkBlock className="h-4 w-4 shrink-0 rounded border-0" />
              <SkLine className="h-4 min-w-[100px] flex-1" />
              <SkLine className="hidden h-3 w-20 sm:block" />
              <SkLine className="h-3 w-14" />
              <SkLine className="h-3 w-8" />
              <SkLine className="hidden h-3 w-16 lg:block" />
              <SkBlock className="h-9 w-12 shrink-0 rounded-md" />
              <SkLine className="hidden h-3 w-24 md:block" />
              <SkBlock className="h-8 w-16 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </RestaurantPageShell>
  );
}

/** İstatistik kartları + liste */
export function RestaurantAnalyticsSkeleton() {
  return (
    <RestaurantPageShell>
      <div className="space-y-8">
        <div className="space-y-3 border-b border-slate-200/80 pb-6">
          <SkLine className="h-3 w-28" />
          <SkLine className="h-3 max-w-2xl" />
          <SkLine className="h-3 max-w-xl opacity-80" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              className={`rounded-2xl border p-5 shadow-sm ring-1 ring-slate-900/[0.04] ${
                i === 0
                  ? "border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white"
                  : "border-slate-200/90 bg-white/90"
              }`}
              key={i}
            >
              <SkLine className="mb-2 h-2.5 w-20" />
              <SkBlock className="h-10 w-24 rounded-lg" />
              <SkLine className="mt-2 h-2.5 w-28 opacity-80" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm ring-1 ring-slate-900/[0.04]">
          <SkLine className="mb-1 h-4 w-56" />
          <SkLine className="mb-4 h-3 w-72 max-w-full opacity-80" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((r) => (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100/90 bg-slate-50/50 px-3 py-2.5" key={r}>
                <SkBlock className="h-8 w-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <SkLine className="h-3 w-2/5" />
                  <SkLine className="h-2.5 w-24 opacity-80" />
                </div>
                <SkLine className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((b) => (
            <SkBlock className="h-10 w-28 rounded-xl" key={b} />
          ))}
        </div>
      </div>
    </RestaurantPageShell>
  );
}

/** Menü ayarları — üst şerit + formlar + görsel kartları */
export function RestaurantMenuSettingsSkeleton() {
  return (
    <RestaurantPageShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <SkLine className="h-3 w-36" />
            <SkLine className="h-3 max-w-xl" />
            <SkLine className="h-3 max-w-lg opacity-80" />
          </div>
          <div className="w-full max-w-md space-y-2 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/[0.04]">
            <SkLine className="h-2.5 w-28" />
            <SkBlock className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="border-b border-slate-100/90 bg-gradient-to-r from-slate-50/90 to-indigo-50/40 px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <SkBlock className="h-8 w-8 rounded-lg" />
              <SkLine className="h-4 w-40" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((f) => (
                <div className="space-y-2" key={f}>
                  <SkLine className="h-2.5 w-24" />
                  <SkBlock className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <SkBlock className="h-8 w-8 rounded-lg" />
              <SkLine className="h-4 w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2].map((f) => (
                <div className={f === 2 ? "sm:col-span-2" : ""} key={f}>
                  <div className="space-y-2">
                    <SkLine className="h-2.5 w-20" />
                    <SkBlock className={`rounded-xl ${f === 2 ? "h-24" : "h-11"} w-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-100/90 bg-slate-50/60 px-6 py-4">
            <SkBlock className="h-11 w-48 rounded-xl" />
          </div>
        </div>

        <div>
          <SkLine className="mb-4 h-3 w-36" />
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1].map((card) => (
              <div
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]"
                key={card}
              >
                <div className="border-b border-slate-100/90 bg-gradient-to-br from-violet-50/50 to-white px-5 py-4">
                  <div className="flex items-center gap-2">
                    <SkBlock className="h-9 w-9 rounded-xl" />
                    <div className="space-y-1.5">
                      <SkLine className="h-4 w-32" />
                      <SkLine className="h-2.5 w-48 max-w-full" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <SkBlock className="mb-4 h-36 w-full rounded-xl" />
                  <SkBlock className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RestaurantPageShell>
  );
}

/** Ürün/kategori ekle — kartlı form */
export function RestaurantFormSkeleton({ variant = "product" }) {
  const isCategory = variant === "category";
  return (
    <RestaurantPageShell>
      <div className="space-y-8">
        <div className="space-y-3 border-b border-slate-200/80 pb-6">
          <SkLine className="h-3 w-40" />
          <SkLine className="h-3 max-w-2xl" />
          <SkLine className="h-3 max-w-xl opacity-80" />
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/[0.04]">
          <SkLine className="mb-1 h-3 w-48" />
          <SkLine className="mb-5 h-3 w-full max-w-md opacity-80" />
          {isCategory ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <SkLine className="h-2.5 w-28" />
                <SkBlock className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <SkLine className="h-2.5 w-24" />
                <SkBlock className="h-11 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-3">
                {[0, 1, 2].map((f) => (
                  <div className="space-y-2" key={f}>
                    <SkLine className="h-2.5 w-20" />
                    <SkBlock className="h-11 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-100/90 bg-slate-50/80 px-4 py-3">
                <div className="flex gap-3">
                  <SkBlock className="h-4 w-4 shrink-0 rounded" />
                  <div className="flex-1 space-y-2">
                    <SkLine className="h-3 w-32" />
                    <SkLine className="h-2.5 w-full max-w-md opacity-80" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!isCategory ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/[0.04]">
            <SkLine className="mb-1 h-3 w-36" />
            <SkLine className="mb-5 h-3 max-w-lg opacity-80" />
            <div className="flex flex-col gap-6 lg:flex-row">
              <SkBlock className="aspect-[4/3] w-full max-w-md rounded-xl lg:shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkLine className="h-2.5 w-24" />
                <SkBlock className="h-10 w-full max-w-xs rounded-xl" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/[0.04]">
          <SkLine className="mb-1 h-3 w-44" />
          <SkLine className="mb-6 h-3 max-w-2xl opacity-80" />
          <div className={`grid gap-4 ${isCategory ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
            {(isCategory ? [0, 1, 2] : [0, 1, 2, 3]).map((g) => (
              <div className="rounded-xl border border-slate-100/90 bg-gradient-to-b from-slate-50/80 to-white p-4" key={g}>
                <div className="mb-3 flex items-center gap-2">
                  <SkBlock className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <SkLine className="h-3 w-24" />
                    <SkLine className="h-2.5 w-16 opacity-80" />
                  </div>
                </div>
                <SkBlock className={`mb-3 w-full rounded-lg ${isCategory ? "h-10" : "h-10"}`} />
                <SkBlock className={`w-full rounded-lg ${isCategory ? "h-16" : "h-20"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:justify-end">
          <SkBlock className="h-11 w-24 rounded-xl sm:w-28" />
          <SkBlock className="h-11 w-40 rounded-xl" />
        </div>
      </div>
    </RestaurantPageShell>
  );
}

/** Ürün/kategori düzenle — üst başlık + formlar (shell dışı sayfalar) */
export function RestaurantEditorSkeleton({ mode = "item" }) {
  const isCategory = mode === "category";
  const sections = isCategory ? [0, 1] : [0, 1, 2];

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <div className="mb-8 space-y-3 border-b border-slate-200/80 pb-6">
        <SkLine className="h-3 w-28" />
        <SkBlock className="h-9 w-64 max-w-full rounded-lg" />
        <SkLine className="h-3 w-48 opacity-80" />
      </div>

      <div className="space-y-6">
        {sections.map((sec) => (
          <div
            className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/[0.04]"
            key={sec}
          >
            <SkLine className="mb-1 h-3 w-40" />
            <SkLine className="mb-5 h-3 max-w-md opacity-80" />
            {sec === 0 && !isCategory ? (
              <div className="grid gap-5 sm:grid-cols-3">
                {[0, 1, 2].map((f) => (
                  <div className="space-y-2" key={f}>
                    <SkLine className="h-2.5 w-20" />
                    <SkBlock className="h-11 w-full rounded-xl" />
                  </div>
                ))}
                <div className="sm:col-span-3 mt-2 rounded-xl border border-slate-100/90 bg-slate-50/80 px-4 py-3">
                  <div className="flex gap-3">
                    <SkBlock className="h-4 w-4 shrink-0 rounded" />
                    <div className="flex-1 space-y-2">
                      <SkLine className="h-3 w-36" />
                      <SkLine className="h-2.5 w-full max-w-lg opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {sec === 0 && isCategory ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,14rem)_1fr] lg:items-start">
                <div className="space-y-2">
                  <SkLine className="h-2.5 w-24" />
                  <SkBlock className="h-11 w-full rounded-xl" />
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <SkBlock className="aspect-[4/3] w-full max-w-xs rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkLine className="h-2.5 w-28" />
                    <SkBlock className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ) : null}
            {sec === 1 && !isCategory ? (
              <div className="flex flex-col gap-6 lg:flex-row">
                <SkBlock className="aspect-[4/3] w-full max-w-md rounded-xl lg:shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkLine className="h-2.5 w-28" />
                  <SkBlock className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ) : null}
            {sec === 1 && isCategory ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2].map((g) => (
                  <div className="rounded-xl border border-slate-100/90 p-4" key={g}>
                    <div className="mb-3 flex gap-2">
                      <SkBlock className="h-8 w-8 rounded-lg" />
                      <div className="space-y-1">
                        <SkLine className="h-3 w-20" />
                        <SkLine className="h-2.5 w-12" />
                      </div>
                    </div>
                    <SkBlock className="mb-2 h-10 w-full rounded-lg" />
                    <SkBlock className="h-16 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : null}
            {sec === 2 && !isCategory ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((g) => (
                  <div className="rounded-xl border border-slate-100/90 p-4" key={g}>
                    <div className="mb-3 flex gap-2">
                      <SkBlock className="h-8 w-8 rounded-lg" />
                      <div className="space-y-1">
                        <SkLine className="h-3 w-20" />
                        <SkLine className="h-2.5 w-12" />
                      </div>
                    </div>
                    <SkBlock className="mb-2 h-10 w-full rounded-lg" />
                    <SkBlock className="h-20 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <SkBlock className="h-11 w-32 rounded-xl" />
          <SkBlock className="h-11 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
