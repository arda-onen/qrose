import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getCategoryTranslation, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import MenuImage from "../components/MenuImage";

export default function StreetFoodTheme({ menu, languageCode, activeCategoryId }) {
  const stickerStyle = useParallaxOffset(0.05, 18);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      <div className="mx-auto max-w-5xl p-3 pb-12 sm:p-4">
        <div className="menu-reveal relative rounded-3xl border-2 border-orange-300 bg-white/90 p-5 shadow-md">
          <div
            className="absolute -right-2 -top-3 rotate-3 rounded-md bg-red-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white"
            style={stickerStyle}
          >
            Fresh Daily
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Street Food</p>
          <h1 className="menu-display-street text-4xl uppercase text-orange-700">
            {menu.restaurant_name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-orange-500">{menu.name}</p>
        </div>

        <div
          className="menu-reveal-soft sticky top-[112px] z-10 mt-4 -mx-1 hidden overflow-x-auto rounded-2xl border-2 border-orange-200 bg-white/95 p-2 shadow-sm backdrop-blur md:block"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex gap-2 px-1">
            {menu.categories.map((category) => (
              <a
                className={`menu-chip-touch whitespace-nowrap rounded-full border-2 px-4 text-xs font-black uppercase tracking-wide transition ${
                  activeCategoryId === category.id
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-orange-200 bg-orange-50 text-orange-700 hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-100"
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
            className="menu-reveal mt-8 scroll-mt-36 md:scroll-mt-32"
            id={categoryAnchor(category.id)}
            key={category.id}
            style={{ animationDelay: `${120 + categoryIndex * 60}ms` }}
          >
            <h2 className="inline-block -rotate-1 rounded-md bg-orange-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow">
              {getCategoryTranslation(category, languageCode).name}
            </h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.items.map((item, itemIndex) => {
                const translation = getItemTranslation(item, languageCode);
                return (
                  <article
                    className={`menu-card menu-reveal overflow-hidden rounded-2xl border-2 bg-white p-3 shadow-sm hover:shadow-md ${
                      itemIndex % 2 === 0 ? "border-orange-300" : "border-red-200"
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
                      <h3 className="font-bold text-orange-700">{translation?.item_name || "Unnamed Item"}</h3>
                      <strong className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {translation?.description || ""}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
