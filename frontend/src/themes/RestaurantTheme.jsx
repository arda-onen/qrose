import MenuImage from "../components/MenuImage";
import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getCategoryTranslation, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import { normalizePaletteKey } from "./themeStyles";

const restaurantPalette = {
  sunset: {
    pageGlow: "bg-orange-400/15",
    panel: "border-orange-700/30 bg-zinc-900/60 text-orange-100",
    navActive: "border-orange-400 bg-orange-500/15 text-orange-300",
    navIdle: "border-orange-800/50 bg-zinc-900 text-orange-100 hover:border-orange-400 hover:text-orange-300",
    title: "text-orange-100",
    divider: "border-orange-700/60",
    price: "bg-orange-500/10 text-orange-300"
  },
  emerald: {
    pageGlow: "bg-emerald-400/15",
    panel: "border-emerald-700/30 bg-zinc-900/60 text-emerald-100",
    navActive: "border-emerald-400 bg-emerald-500/15 text-emerald-300",
    navIdle: "border-emerald-800/50 bg-zinc-900 text-emerald-100 hover:border-emerald-400 hover:text-emerald-300",
    title: "text-emerald-100",
    divider: "border-emerald-700/60",
    price: "bg-emerald-500/10 text-emerald-300"
  },
  royal: {
    pageGlow: "bg-indigo-400/15",
    panel: "border-indigo-700/30 bg-zinc-900/60 text-indigo-100",
    navActive: "border-indigo-400 bg-indigo-500/15 text-indigo-300",
    navIdle: "border-indigo-800/50 bg-zinc-900 text-indigo-100 hover:border-indigo-400 hover:text-indigo-300",
    title: "text-indigo-100",
    divider: "border-indigo-700/60",
    price: "bg-indigo-500/10 text-indigo-300"
  }
};

export default function RestaurantTheme({ menu, languageCode, activeCategoryId, colorPalette }) {
  const palette = restaurantPalette[normalizePaletteKey(colorPalette)];
  const glowStyle = useParallaxOffset(0.04, 20);
  const spotlightItems = menu.categories
    .flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: getCategoryTranslation(category, languageCode).name
      }))
    )
    .slice(0, 3);
  const heroImage = menu.hero_image || spotlightItems.find((item) => item.image)?.image;

  return (
    <div className="mx-auto max-w-6xl p-3 pb-12 sm:p-4">
      <div className={`menu-reveal relative overflow-hidden rounded-3xl border p-7 text-center shadow-2xl ${palette.panel}`}>
        {heroImage ? (
          <MenuImage
            alt="hero"
            className="absolute inset-0 h-full w-full object-cover"
            src={heroImage.startsWith("/uploads/") ? apiFileUrl(heroImage) : heroImage}
            wrapperClassName="absolute inset-0"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/55" />
        <div className={`absolute -left-10 -top-10 h-32 w-32 rounded-full blur-2xl ${palette.pageGlow}`} style={glowStyle} />
        <p className="relative text-xs uppercase tracking-[0.25em] text-white/90">Restaurant Theme</p>
        <h1 className="menu-display-luxury relative mt-2 text-4xl tracking-wide">{menu.restaurant_name}</h1>
        <p className="relative mx-auto mt-2 max-w-2xl text-sm text-white/90">{menu.name}</p>
        <div className="relative mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
            Fine Dining
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
            Reservation Recommended
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
            Seasonal Tasting
          </span>
        </div>
      </div>

      <div className="menu-reveal mt-3 grid gap-3 md:grid-cols-3">
        {spotlightItems.map((item) => {
          const translation = getItemTranslation(item, languageCode);
          return (
            <article className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/80 shadow-lg" key={item.id}>
              {item.image ? (
                <MenuImage
                  alt={translation?.item_name || "menu item"}
                  className="h-40 w-full object-cover"
                  src={apiFileUrl(item.image)}
                />
              ) : (
                <div className="h-40 bg-zinc-800" />
              )}
              <div className="p-3 text-zinc-100">
                <p className="menu-display-luxury text-lg">{translation?.item_name || "Unnamed Item"}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">{item.categoryName}</p>
                  <strong className={`rounded-full px-2 py-0.5 text-xs ${palette.price}`}>{formatPrice(item.price)}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="menu-reveal-soft sticky top-[56px] z-10 mt-5 hidden overflow-x-auto rounded-2xl border border-white/20 bg-zinc-950/70 p-2 shadow backdrop-blur md:block">
        <div className="flex gap-2 px-1">
          {menu.categories.map((category) => (
            <a
              className={`menu-chip-touch whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition ${
                activeCategoryId === category.id ? palette.navActive : palette.navIdle
              }`}
              href={`#${categoryAnchor(category.id)}`}
              key={category.id}
            >
              {getCategoryTranslation(category, languageCode).name}
            </a>
          ))}
        </div>
      </div>

      {menu.categories.map((category, categoryIndex) => (
        <section
          className="menu-reveal mt-8 scroll-mt-20 sm:mt-9 md:scroll-mt-24"
          id={categoryAnchor(category.id)}
          key={category.id}
          style={{ animationDelay: `${120 + categoryIndex * 70}ms` }}
        >
          <h2 className={`mb-5 border-b pb-2 text-2xl ${palette.divider} menu-display-luxury ${palette.title}`}>
            {getCategoryTranslation(category, languageCode).name}
          </h2>
          {category.items[0]?.image ? (
            <MenuImage
              alt={getCategoryTranslation(category, languageCode).name}
              className="mb-3 h-40 w-full rounded-2xl object-cover"
              src={apiFileUrl(category.items[0].image)}
              wrapperClassName="mb-3 rounded-2xl border border-white/10"
            />
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {category.items.map((item, itemIndex) => {
              const translation = getItemTranslation(item, languageCode);
              const reverseLayout = itemIndex % 2 === 1;

              return (
                <article
                  className="menu-card menu-reveal overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 text-zinc-100"
                  key={item.id}
                  style={{ animationDelay: `${170 + itemIndex * 50}ms` }}
                >
                  <div className={`grid items-stretch lg:grid-cols-2 ${reverseLayout ? "lg:[&>*:first-child]:order-2" : ""}`}>
                    {item.image ? (
                      <MenuImage
                        alt={translation?.item_name || "menu item"}
                        className="h-52 w-full object-cover lg:h-60"
                        wrapperClassName="h-52 lg:h-60"
                        src={apiFileUrl(item.image)}
                      />
                    ) : (
                      <div className="h-52 bg-gradient-to-br from-zinc-800 to-zinc-900 lg:h-60" />
                    )}
                    <div className="flex flex-col justify-between p-5">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="menu-display-luxury text-2xl">
                            {translation?.item_name || "Unnamed Item"}
                          </h3>
                          <strong className={`rounded-full px-3 py-1 text-sm ${palette.price}`}>
                            {formatPrice(item.price)}
                          </strong>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                          {translation?.description || ""}
                        </p>
                      </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Chef Selection</p>
                          <p className="text-xs uppercase tracking-wide text-zinc-500">Pairing suggested</p>
                        </div>
                    </div>
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
