import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getCategoryTranslation, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import MenuImage from "../components/MenuImage";

export default function MinimalTheme({ menu, languageCode, activeCategoryId }) {
  const accentStyle = useParallaxOffset(0.02, 10);

  return (
    <div className="mx-auto max-w-4xl p-3 pb-12 sm:p-4">
      <div className="menu-reveal relative mb-2 border-b border-slate-200 pb-5">
        <div className="absolute -bottom-px left-0 h-px w-24 bg-slate-900/70" style={accentStyle} />
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Minimal</p>
        <h1 className="menu-display-minimal text-3xl font-light tracking-wide text-slate-900">
          {menu.restaurant_name}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-500">{menu.name}</p>
      </div>

      <div
        className="menu-reveal-soft sticky top-[112px] z-10 mt-4 -mx-1 hidden overflow-x-auto border-y border-slate-200 bg-white/95 py-2 backdrop-blur md:block"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex gap-2 px-2">
          {menu.categories.map((category) => (
            <a
              className={`menu-chip-touch whitespace-nowrap rounded-full border px-4 text-xs font-medium transition ${
                activeCategoryId === category.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900"
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
          className="menu-reveal mt-9 scroll-mt-36 sm:mt-10 md:scroll-mt-32"
          id={categoryAnchor(category.id)}
          key={category.id}
          style={{ animationDelay: `${110 + categoryIndex * 60}ms` }}
        >
          <h2 className="mb-5 text-xs uppercase tracking-[0.25em] text-slate-500">
            {getCategoryTranslation(category, languageCode).name}
          </h2>
          <div className="space-y-4">
            {category.items.map((item, itemIndex) => {
              const translation = getItemTranslation(item, languageCode);
              return (
                <article
                  className="menu-reveal grid gap-4 border-b border-slate-200 pb-5 sm:grid-cols-[1fr_auto]"
                  key={item.id}
                  style={{ animationDelay: `${140 + itemIndex * 40}ms` }}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-base font-medium text-slate-900">
                        {translation?.item_name || "Unnamed Item"}
                      </h3>
                      <strong className="text-sm text-slate-700">{formatPrice(item.price)}</strong>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {translation?.description || ""}
                    </p>
                  </div>
                  {item.image ? (
                    <MenuImage
                      alt={translation?.item_name || "menu item"}
                      className="h-24 w-full rounded-xl object-cover sm:w-32"
                      wrapperClassName="rounded-xl"
                      src={apiFileUrl(item.image)}
                    />
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
