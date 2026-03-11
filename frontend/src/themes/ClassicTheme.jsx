import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import MenuImage from "../components/MenuImage";

export default function ClassicTheme({ menu, languageCode, activeCategoryId }) {
  const totalItems = menu.categories.reduce((sum, category) => sum + category.items.length, 0);
  const heroAccentStyle = useParallaxOffset(0.035, 16);

  return (
    <div className="mx-auto max-w-6xl p-3 pb-12 sm:p-4 sm:pb-14">
      <div className="menu-reveal relative overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-6 shadow-lg sm:p-8">
        <div
          className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-200/40 blur-2xl"
          style={heroAccentStyle}
        />
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Classic Restaurant</p>
        <h1 className="menu-display-classic mt-2 text-4xl font-bold tracking-tight text-slate-900">
          {menu.restaurant_name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{menu.name}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
            {menu.categories.length} categories
          </span>
          <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {totalItems} dishes
          </span>
        </div>
      </div>

      <div
        className="menu-reveal-soft sticky top-[112px] z-10 mt-5 -mx-1 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur md:block"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex gap-2 px-1">
          {menu.categories.map((category) => (
            <a
              className={`menu-chip-touch whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition ${
                activeCategoryId === category.id
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-700"
              }`}
              href={`#${categoryAnchor(category.id)}`}
              key={category.id}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      {menu.categories.map((category, categoryIndex) => (
        <section
          className="menu-reveal mt-9 scroll-mt-36 sm:mt-10 md:scroll-mt-32"
          id={categoryAnchor(category.id)}
          key={category.id}
          style={{ animationDelay: `${120 + categoryIndex * 60}ms` }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xl font-semibold text-slate-800">{category.name}</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {category.items.length} options
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {category.items.map((item, itemIndex) => {
              const translation = getItemTranslation(item, languageCode);
              return (
                <article
                  className="menu-card menu-reveal grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[170px_1fr]"
                  key={item.id}
                  style={{ animationDelay: `${140 + itemIndex * 45}ms` }}
                >
                  {item.image ? (
                    <MenuImage
                      alt={translation?.item_name || "menu item"}
                      className="h-40 w-full object-cover sm:h-full"
                      wrapperClassName="sm:h-full"
                      src={apiFileUrl(item.image)}
                    />
                  ) : (
                    <div className="hidden bg-slate-100 sm:block" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {translation?.item_name || "Unnamed Item"}
                      </h3>
                      <strong className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {translation?.description || ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
