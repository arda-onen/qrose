import MenuImage from "../components/MenuImage";
import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import { normalizePaletteKey } from "./themeStyles";

const fastFoodPalette = {
  sunset: {
    heroBorder: "border-orange-300",
    heroText: "text-orange-700",
    heroSub: "text-orange-500",
    sticker: "bg-red-500 text-white",
    navActive: "border-orange-500 bg-orange-500 text-white",
    navIdle: "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-500 hover:bg-orange-100",
    sectionBadge: "bg-orange-600 text-white",
    cardBorderA: "border-orange-300",
    cardBorderB: "border-red-200",
    price: "bg-orange-100 text-orange-700"
  },
  emerald: {
    heroBorder: "border-emerald-300",
    heroText: "text-emerald-700",
    heroSub: "text-emerald-500",
    sticker: "bg-emerald-600 text-white",
    navActive: "border-emerald-500 bg-emerald-500 text-white",
    navIdle: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100",
    sectionBadge: "bg-emerald-600 text-white",
    cardBorderA: "border-emerald-300",
    cardBorderB: "border-teal-200",
    price: "bg-emerald-100 text-emerald-700"
  },
  royal: {
    heroBorder: "border-indigo-300",
    heroText: "text-indigo-700",
    heroSub: "text-indigo-500",
    sticker: "bg-indigo-600 text-white",
    navActive: "border-indigo-500 bg-indigo-500 text-white",
    navIdle: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-500 hover:bg-indigo-100",
    sectionBadge: "bg-indigo-600 text-white",
    cardBorderA: "border-indigo-300",
    cardBorderB: "border-violet-200",
    price: "bg-indigo-100 text-indigo-700"
  }
};

export default function FastFoodTheme({ menu, languageCode, activeCategoryId, colorPalette }) {
  const palette = fastFoodPalette[normalizePaletteKey(colorPalette)];
  const stickerStyle = useParallaxOffset(0.05, 18);
  const heroItems = menu.categories
    .flatMap((category) => category.items.map((item) => ({ ...item, categoryName: category.name })))
    .slice(0, 4);
  const heroImage = heroItems.find((item) => item.image)?.image;

  return (
    <div className="mx-auto max-w-6xl p-3 pb-12 sm:p-4">
      <div className={`menu-reveal relative rounded-3xl border-2 bg-white/90 p-5 shadow-md ${palette.heroBorder}`}>
        {heroImage ? (
          <MenuImage
            alt="hero"
            className="absolute inset-0 h-full w-full object-cover"
            src={apiFileUrl(heroImage)}
            wrapperClassName="absolute inset-0 rounded-3xl"
          />
        ) : null}
        <div className="absolute inset-0 rounded-3xl bg-white/70" />
        <div className={`absolute -right-2 -top-3 rotate-3 rounded-md px-3 py-1 text-xs font-black uppercase tracking-wide ${palette.sticker}`} style={stickerStyle}>
          Hot Picks
        </div>
        <p className={`relative text-xs font-black uppercase tracking-[0.2em] ${palette.heroSub}`}>Fast Food Theme</p>
        <h1 className={`menu-display-street relative text-4xl uppercase ${palette.heroText}`}>{menu.restaurant_name}</h1>
        <p className={`relative mt-1 max-w-2xl text-sm font-medium ${palette.heroSub}`}>{menu.name}</p>
        <div className="relative mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
            20 min delivery
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
            Combo deals
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
            Late night
          </span>
        </div>
      </div>

      <div className="menu-reveal mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {heroItems.map((item, index) => {
          const translation = getItemTranslation(item, languageCode);
          return (
            <article className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${index % 2 === 0 ? palette.cardBorderA : palette.cardBorderB}`} key={item.id}>
              {item.image ? (
                <MenuImage
                  alt={translation?.item_name || "menu item"}
                  className="h-40 w-full object-cover"
                  src={apiFileUrl(item.image)}
                />
              ) : (
                <div className="h-40 bg-slate-100" />
              )}
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate font-bold ${palette.heroText}`}>{translation?.item_name || "Unnamed Item"}</p>
                  <strong className={`rounded-full px-2 py-1 text-xs ${palette.price}`}>{formatPrice(item.price)}</strong>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.categoryName}</p>
                <div className="mt-2 flex gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">Top</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">Quick</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="menu-reveal-soft sticky top-[56px] z-10 mt-4 hidden overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur md:block">
        <div className="flex gap-2 px-1">
          {menu.categories.map((category) => (
            <a
              className={`menu-chip-touch whitespace-nowrap rounded-full border-2 px-4 text-xs font-black uppercase tracking-wide transition ${
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
          className="menu-reveal mt-7 scroll-mt-20 md:scroll-mt-24"
          id={categoryAnchor(category.id)}
          key={category.id}
          style={{ animationDelay: `${120 + categoryIndex * 60}ms` }}
        >
          <h2 className={`inline-block -rotate-1 rounded-md px-3 py-1 text-xs font-black uppercase tracking-wider shadow ${palette.sectionBadge}`}>
            {category.name}
          </h2>
          {category.items[0]?.image ? (
            <MenuImage
              alt={category.name}
              className="mb-3 h-36 w-full rounded-2xl object-cover"
              src={apiFileUrl(category.items[0].image)}
              wrapperClassName="mb-3 rounded-2xl border-2 border-slate-200"
            />
          ) : null}
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.items.map((item, itemIndex) => {
              const translation = getItemTranslation(item, languageCode);
              const itemTag = itemIndex % 3 === 0 ? "Popular" : itemIndex % 3 === 1 ? "New" : "Spicy";
              return (
                <article
                  className={`menu-card menu-reveal overflow-hidden rounded-2xl border-2 bg-white p-3 shadow-sm ${
                    itemIndex % 2 === 0 ? palette.cardBorderA : palette.cardBorderB
                  }`}
                  key={item.id}
                  style={{ animationDelay: `${160 + itemIndex * 45}ms` }}
                >
                  {item.image ? (
                    <MenuImage
                      alt={translation?.item_name || "menu item"}
                      className="mb-3 h-40 w-full rounded-xl object-cover"
                      wrapperClassName="mb-3 rounded-xl"
                      src={apiFileUrl(item.image)}
                    />
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={palette.heroText}>{translation?.item_name || "Unnamed Item"}</h3>
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {itemTag}
                      </span>
                    </div>
                    <strong className={`rounded-full px-3 py-1 text-sm ${palette.price}`}>{formatPrice(item.price)}</strong>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{translation?.description || ""}</p>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
