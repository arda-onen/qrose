import MenuImage from "../components/MenuImage";
import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import { normalizePaletteKey } from "./themeStyles";

const cafePalette = {
  sunset: {
    hero: "from-orange-50 via-white to-amber-50 border-orange-200",
    badge: "border-orange-300 bg-orange-50 text-orange-700",
    navActive: "border-orange-400 bg-orange-500 text-white",
    navIdle: "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-700",
    price: "bg-orange-100 text-orange-800",
    sectionTitle: "text-slate-900",
    accent: "bg-orange-200/40"
  },
  emerald: {
    hero: "from-emerald-50 via-white to-teal-50 border-emerald-200",
    badge: "border-emerald-300 bg-emerald-50 text-emerald-700",
    navActive: "border-emerald-400 bg-emerald-500 text-white",
    navIdle: "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700",
    price: "bg-emerald-100 text-emerald-800",
    sectionTitle: "text-slate-900",
    accent: "bg-emerald-200/40"
  },
  royal: {
    hero: "from-indigo-50 via-white to-violet-50 border-indigo-200",
    badge: "border-indigo-300 bg-indigo-50 text-indigo-700",
    navActive: "border-indigo-400 bg-indigo-500 text-white",
    navIdle: "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700",
    price: "bg-indigo-100 text-indigo-800",
    sectionTitle: "text-slate-900",
    accent: "bg-indigo-200/40"
  }
};

export default function CafeTheme({ menu, languageCode, activeCategoryId, colorPalette }) {
  const palette = cafePalette[normalizePaletteKey(colorPalette)];
  const accentStyle = useParallaxOffset(0.03, 16);
  const totalItems = menu.categories.reduce((sum, category) => sum + category.items.length, 0);
  const featuredItems = menu.categories.flatMap((category) => category.items).slice(0, 3);
  const heroImage = menu.hero_image || featuredItems.find((item) => item.image)?.image;

  return (
    <div className="mx-auto max-w-6xl p-3 pb-12 sm:p-4">
      <div className={`menu-reveal relative overflow-hidden rounded-[2rem] border bg-gradient-to-r p-5 shadow-lg sm:p-7 ${palette.hero}`}>
        {heroImage ? (
          <MenuImage
            alt="hero"
            className="absolute inset-0 h-full w-full object-cover"
            src={heroImage.startsWith("/uploads/") ? apiFileUrl(heroImage) : heroImage}
            wrapperClassName="absolute inset-0"
          />
        ) : null}
        <div className="absolute inset-0 bg-white/75" />
        <div
          className={`absolute -right-8 -top-8 h-36 w-36 rounded-full blur-2xl ${palette.accent}`}
          style={accentStyle}
        />
        <p className="relative text-xs uppercase tracking-[0.3em] text-slate-600">Cafe Theme</p>
        <h1 className="menu-display-classic relative mt-2 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {menu.restaurant_name}
        </h1>
        <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{menu.name}</p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {menu.categories.length} categories
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {totalItems} dishes
          </span>
        </div>
      </div>

      <div className="menu-reveal mt-3 grid gap-3 sm:grid-cols-3">
        {featuredItems.map((item) => {
          const translation = getItemTranslation(item, languageCode);
          return (
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={item.id}>
              {item.image ? (
                <MenuImage
                  alt={translation?.item_name || "menu item"}
                  className="h-36 w-full object-cover"
                  src={apiFileUrl(item.image)}
                />
              ) : (
                <div className="h-36 bg-slate-100" />
              )}
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-slate-900">{translation?.item_name || "Unnamed Item"}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Featured</span>
                  <strong className={`rounded-full px-2 py-0.5 text-xs ${palette.price}`}>{formatPrice(item.price)}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="menu-reveal-soft sticky top-[56px] z-10 mt-5 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur md:block">
        <div className="flex gap-2 px-1">
          {menu.categories.map((category) => (
            <a
              className={`menu-chip-touch whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition ${
                activeCategoryId === category.id ? palette.navActive : palette.navIdle
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
          className="menu-reveal mt-7 scroll-mt-20 sm:mt-8 md:scroll-mt-24"
          id={categoryAnchor(category.id)}
          key={category.id}
          style={{ animationDelay: `${120 + categoryIndex * 50}ms` }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className={`text-xl font-semibold ${palette.sectionTitle}`}>{category.name}</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {category.items.length} options
            </span>
          </div>
          {category.items[0]?.image ? (
            <MenuImage
              alt={category.name}
              className="mb-3 h-36 w-full rounded-2xl object-cover"
              src={apiFileUrl(category.items[0].image)}
              wrapperClassName="mb-3 rounded-2xl border border-slate-200"
            />
          ) : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {category.items.map((item, itemIndex) => {
              const translation = getItemTranslation(item, languageCode);
              return (
                <article
                  className="menu-card menu-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  key={item.id}
                  style={{ animationDelay: `${140 + itemIndex * 35}ms` }}
                >
                  {item.image ? (
                    <MenuImage
                      alt={translation?.item_name || "menu item"}
                      className="h-44 w-full object-cover"
                      src={apiFileUrl(item.image)}
                    />
                  ) : (
                    <div className="h-44 bg-slate-100" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {translation?.item_name || "Unnamed Item"}
                      </h3>
                      <strong className={`rounded-full px-3 py-1 text-sm ${palette.price}`}>
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
