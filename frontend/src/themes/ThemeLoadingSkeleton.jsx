import { SkBlock, SkLine } from "../components/skeletons/SkeletonPrimitives";

/** Halka açık menü — tema önizlemesi için zengin iskelet (shimmer) */
function ClassicSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-4 pb-14">
      <div className="rounded-[2rem] border border-amber-200/90 bg-gradient-to-r from-amber-50/95 via-white to-amber-50/95 p-8 shadow-sm ring-1 ring-amber-900/5">
        <SkLine className="h-3 w-40" />
        <SkBlock className="mt-3 h-10 max-w-md rounded-xl" />
        <SkLine className="mt-2 h-4 max-w-sm opacity-90" />
        <div className="mt-6 flex gap-2 overflow-hidden pb-1">
          {[0, 1, 2, 3].map((i) => (
            <SkBlock className="h-9 min-w-[4.5rem] shrink-0 rounded-full" key={i} />
          ))}
        </div>
      </div>
      <div className="mt-8 space-y-6">
        <SkLine className="h-6 w-48" />
        {[0, 1, 2].map((i) => (
          <div className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5" key={i}>
            <SkBlock className="h-24 w-28 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <SkLine className="h-4 w-3/5 max-w-xs" />
              <SkLine className="h-3 w-full max-w-md opacity-85" />
              <SkBlock className="mt-2 h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DarkSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-4 pb-14">
      <div className="rounded-3xl border border-cyan-400/25 bg-slate-900/85 p-7 shadow-xl ring-1 ring-cyan-500/10">
        <SkLine className="h-3 w-32 opacity-90" />
        <SkBlock className="mt-3 h-10 max-w-sm rounded-xl opacity-90" />
        <SkLine className="mt-2 h-4 max-w-xs opacity-75" />
        <div className="mt-6 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <SkBlock className="h-9 w-20 shrink-0 rounded-lg opacity-80" key={i} />
          ))}
        </div>
      </div>
      <div className="mt-8 space-y-5">
        {[0, 1, 2].map((i) => (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4" key={i}>
            <SkLine className="h-4 w-40" />
            <SkLine className="mt-2 h-3 w-full max-w-lg opacity-80" />
            <div className="mt-4 flex justify-between gap-4">
              <SkBlock className="h-20 w-24 rounded-xl opacity-75" />
              <div className="flex-1 space-y-2">
                <SkLine className="h-4 w-2/3" />
                <SkLine className="h-3 w-full opacity-80" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MinimalSkeleton() {
  return (
    <div className="mx-auto max-w-4xl p-4 pb-12">
      <div className="border-b border-slate-200/90 pb-6">
        <SkLine className="h-3 w-24" />
        <SkBlock className="mt-3 h-9 max-w-sm rounded-lg" />
        <SkLine className="mt-2 h-3 max-w-md opacity-85" />
      </div>
      <div className="mt-8 space-y-6">
        {[0, 1, 2].map((key) => (
          <div className="border-b border-slate-200/80 pb-6" key={key}>
            <SkLine className="w-3/4 max-w-md" />
            <SkLine className="mt-2 h-3 w-full" />
            <SkLine className="mt-2 h-3 w-2/3 opacity-90" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LuxurySkeleton() {
  return (
    <div className="mx-auto max-w-5xl p-4 pb-12">
      <div className="rounded-3xl border border-amber-700/35 bg-zinc-900/70 p-7 shadow-2xl ring-1 ring-amber-900/20">
        <div className="mx-auto max-w-lg text-center">
          <SkLine className="mx-auto h-3 w-36 opacity-90" />
          <SkBlock className="mx-auto mt-3 h-10 max-w-sm rounded-lg" />
          <SkLine className="mx-auto mt-2 h-3 w-48 opacity-75" />
        </div>
      </div>
      <div className="mt-10 space-y-6">
        {[0, 1].map((i) => (
          <div className="rounded-2xl border border-amber-800/30 bg-zinc-900/50 p-5" key={i}>
            <SkLine className="h-5 w-44" />
            <SkLine className="mt-3 h-3 w-full max-w-xl opacity-80" />
            <div className="mt-4 flex gap-3">
              <SkBlock className="h-28 w-32 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkLine className="h-4 w-32" />
                <SkLine className="h-3 w-full" />
                <SkBlock className="h-7 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreetFoodSkeleton() {
  return (
    <div className="mx-auto max-w-5xl p-4 pb-12">
      <div className="rounded-3xl border-2 border-orange-200/90 bg-white/95 p-6 shadow-lg ring-1 ring-orange-100">
        <SkLine className="h-3 w-32" />
        <SkBlock className="mt-3 h-10 max-w-xs rounded-xl" />
        <SkLine className="mt-2 h-3 max-w-sm opacity-85" />
        <div className="mt-5 flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((i) => (
            <SkBlock className="h-10 w-24 rounded-full" key={i} />
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div className="rounded-2xl border border-orange-100/90 bg-white p-4 shadow-sm" key={i}>
            <SkBlock className="aspect-[4/3] w-full rounded-xl" />
            <SkLine className="mt-3 h-4 w-2/3" />
            <SkLine className="mt-1 h-3 w-1/3 opacity-80" />
          </div>
        ))}
      </div>
    </div>
  );
}

const skeletonMap = {
  cafe: ClassicSkeleton,
  restaurant: LuxurySkeleton,
  fast_food: StreetFoodSkeleton,
  dark_modern: DarkSkeleton,
  minimal: MinimalSkeleton
};

export default function ThemeLoadingSkeleton({ themeKey }) {
  const Skeleton = skeletonMap[themeKey] || StreetFoodSkeleton;
  return (
    <div className="min-h-[50vh]">
      <Skeleton />
    </div>
  );
}
