function SkeletonLine({ widthClass = "w-full" }) {
  return <div className={`h-3 ${widthClass} rounded bg-white/70`} />;
}

function ClassicSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-4 pb-14 animate-pulse">
      <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-8">
        <div className="h-3 w-40 rounded bg-amber-200" />
        <div className="mt-3 h-10 w-80 rounded bg-amber-200" />
        <div className="mt-2 h-4 w-64 rounded bg-amber-100" />
      </div>
    </div>
  );
}

function DarkSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-4 pb-14 animate-pulse">
      <div className="rounded-3xl border border-cyan-400/30 bg-slate-900/80 p-7">
        <div className="h-3 w-32 rounded bg-cyan-300/40" />
        <div className="mt-3 h-10 w-72 rounded bg-cyan-300/30" />
        <div className="mt-2 h-4 w-56 rounded bg-slate-700" />
      </div>
    </div>
  );
}

function MinimalSkeleton() {
  return (
    <div className="mx-auto max-w-4xl p-4 pb-12 animate-pulse">
      <div className="border-b border-slate-200 pb-5">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="mt-3 h-9 w-80 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-64 rounded bg-slate-100" />
      </div>
      <div className="mt-8 space-y-5">
        {[0, 1, 2].map((key) => (
          <div className="border-b border-slate-200 pb-5" key={key}>
            <SkeletonLine widthClass="w-3/4" />
            <div className="mt-2">
              <SkeletonLine widthClass="w-full" />
            </div>
            <div className="mt-2">
              <SkeletonLine widthClass="w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LuxurySkeleton() {
  return (
    <div className="mx-auto max-w-5xl p-4 pb-12 animate-pulse">
      <div className="rounded-3xl border border-amber-700/30 bg-zinc-900/60 p-7">
        <div className="mx-auto h-3 w-36 rounded bg-amber-300/40" />
        <div className="mx-auto mt-3 h-10 w-80 rounded bg-amber-300/30" />
      </div>
    </div>
  );
}

function StreetFoodSkeleton() {
  return (
    <div className="mx-auto max-w-5xl p-4 pb-12 animate-pulse">
      <div className="rounded-3xl border-2 border-orange-300 bg-white/90 p-5">
        <div className="h-3 w-28 rounded bg-orange-200" />
        <div className="mt-3 h-9 w-72 rounded bg-orange-200" />
        <div className="mt-2 h-4 w-56 rounded bg-orange-100" />
      </div>
    </div>
  );
}

const skeletonMap = {
  cafe: ClassicSkeleton,
  restaurant: LuxurySkeleton,
  fast_food: StreetFoodSkeleton
};

export default function ThemeLoadingSkeleton({ themeKey }) {
  const Skeleton = skeletonMap[themeKey] || ClassicSkeleton;
  return <Skeleton />;
}
