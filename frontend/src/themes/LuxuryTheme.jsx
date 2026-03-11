import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import MenuImage from "../components/MenuImage";

export default function LuxuryTheme({ menu, languageCode, activeCategoryId }) {
  const accentStyle = useParallaxOffset(0.045, 20);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#3f2d1f,_#18181b_45%)] text-amber-100">
      <div className="mx-auto max-w-5xl p-3 pb-12 sm:p-4">
        <div className="menu-reveal relative overflow-hidden rounded-3xl border border-amber-700/30 bg-zinc-900/50 p-7 text-center shadow-2xl">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl" style={accentStyle} />
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Luxury Signature</p>
          <h1 className="menu-display-luxury mt-2 text-4xl tracking-wide">{menu.restaurant_name}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-amber-300/90">{menu.name}</p>
        </div>

        <div
          className="menu-reveal-soft sticky top-[112px] z-10 mt-4 -mx-1 hidden overflow-x-auto rounded-2xl border border-amber-800/40 bg-zinc-900/80 p-2 shadow backdrop-blur md:block"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex gap-2 px-1">
            {menu.categories.map((category) => (
              <a
                className={`menu-chip-touch whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition ${
                  activeCategoryId === category.id
                    ? "border-amber-400 bg-amber-500/10 text-amber-300"
                    : "border-amber-700/40 bg-zinc-800 text-amber-100 hover:-translate-y-0.5 hover:border-amber-400 hover:text-amber-300"
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
            style={{ animationDelay: `${120 + categoryIndex * 70}ms` }}
          >
            <h2 className="mb-5 border-b border-amber-700/70 pb-2 font-serif text-2xl">{category.name}</h2>
            <div className="space-y-5">
              {category.items.map((item, itemIndex) => {
                const translation = getItemTranslation(item, languageCode);
                const reverseLayout = itemIndex % 2 === 1;

                return (
                  <article
                    className="menu-card menu-reveal overflow-hidden rounded-2xl border border-amber-700/35 bg-zinc-800/90 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-900/20"
                    key={item.id}
                    style={{ animationDelay: `${170 + itemIndex * 50}ms` }}
                  >
                    <div className={`grid items-stretch md:grid-cols-2 ${reverseLayout ? "md:[&>*:first-child]:order-2" : ""}`}>
                      {item.image ? (
                        <MenuImage
                          alt={translation?.item_name || "menu item"}
                          className="h-60 w-full object-cover"
                          wrapperClassName="h-60"
                          src={apiFileUrl(item.image)}
                        />
                      ) : (
                        <div className="h-60 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                      )}
                      <div className="flex flex-col justify-between p-5">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="menu-display-luxury text-2xl">
                              {translation?.item_name || "Unnamed Item"}
                            </h3>
                            <strong className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                              {formatPrice(item.price)}
                            </strong>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-amber-100/80">
                            {translation?.description || ""}
                          </p>
                        </div>
                        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-amber-400/80">
                          Chef Selection
                        </p>
                      </div>
                    </div>
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
