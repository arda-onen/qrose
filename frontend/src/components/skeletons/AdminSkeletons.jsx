import { SkBlock, SkLine } from "./SkeletonPrimitives";

export function AdminMenusListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]" key={i}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <SkLine className="h-5 w-48 max-w-[80%]" />
              <SkLine className="h-3 w-32 opacity-85" />
              <SkLine className="h-3 w-56 max-w-full opacity-75" />
            </div>
            <div className="flex gap-2">
              <SkBlock className="h-7 w-16 shrink-0 rounded-full" />
              <SkBlock className="h-7 w-14 shrink-0 rounded-full" />
            </div>
          </div>
          <SkLine className="mt-3 h-3 w-full max-w-2xl opacity-80" />
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((b) => (
              <SkBlock className="h-8 w-28 rounded-md" key={b} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
