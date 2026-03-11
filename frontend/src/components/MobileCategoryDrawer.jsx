import { categoryAnchor } from "../lib/menuThemeUtils";

export default function MobileCategoryDrawer({ categories, activeCategoryId, chipBaseClass, chipActiveClass }) {
  if (!categories?.length) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="rounded-2xl border border-white/30 bg-white/80 p-2 shadow-xl backdrop-blur">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-1">
          {categories.map((category) => (
            <a
              className={`menu-chip-touch snap-start whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition ${
                activeCategoryId === category.id ? chipActiveClass : chipBaseClass
              }`}
              href={`#${categoryAnchor(category.id)}`}
              key={category.id}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
