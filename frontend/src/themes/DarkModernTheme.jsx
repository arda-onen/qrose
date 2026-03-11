import { apiFileUrl } from "../lib/api";
import { categoryAnchor, formatPrice, getItemTranslation } from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import MenuImage from "../components/MenuImage";

export default function DarkModernTheme({ menu, languageCode, activeCategoryId }) {
  const accentStyle = useParallaxOffset(0.04, 18);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#155e75_0%,_#0f172a_32%,_#020617_70%)] text-slate-100">
      <div className="mx-auto max-w-6xl p-3 pb-12 sm:p-4">
        <div className="menu-reveal relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/90 to-slate-800/70 p-6 shadow-xl shadow-cyan-900/20">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" style={accentStyle} />
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Dark Modern</p>
          <h1 className="menu-display-dark text-3xl font-bold tracking-tight">{menu.restaurant_name}</h1>
          <p className="mt-1 text-sm text-slate-400">{menu.name}</p>
        </div>

        <div
          className="menu-reveal-soft sticky top-[112px] z-10 mt-4 -mx-1 hidden overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2 shadow backdrop-blur md:block"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex gap-2 px-1">
            {menu.categories.map((category) => (
              <a
                className={`menu-chip-touch whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition ${
                  activeCategoryId === category.id
                    ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-600 bg-slate-800 text-slate-200 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:text-cyan-300"
                }`}
                href={`#${categoryAnchor(category.id)}`}
                key={category.id}
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-8 lg:mt-8 lg:grid-cols-[230px_1fr]">
          <aside
            className="menu-reveal hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 lg:block"
            style={{ animationDelay: "130ms" }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Quick Nav</p>
            <ul className="mt-3 space-y-2">
              {menu.categories.map((category) => (
                <li key={category.id}>
                  <a
                    className={`block rounded-xl border px-3 py-2 text-sm transition ${
                      activeCategoryId === category.id
                        ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                        : "border-transparent bg-slate-800/70 text-slate-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:text-cyan-300"
                    }`}
                    href={`#${categoryAnchor(category.id)}`}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            {menu.categories.map((category, categoryIndex) => (
              <section
                className="menu-reveal mb-8 scroll-mt-36 md:scroll-mt-32"
                id={categoryAnchor(category.id)}
                key={category.id}
                style={{ animationDelay: `${140 + categoryIndex * 70}ms` }}
              >
                <h2 className="mb-4 text-lg font-semibold text-cyan-300">{category.name}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.items.map((item, itemIndex) => {
                    const translation = getItemTranslation(item, languageCode);
                    return (
                      <article
                        className={`menu-card menu-reveal overflow-hidden rounded-2xl border p-3 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-900/20 ${
                          itemIndex % 3 === 0
                            ? "border-cyan-500/40 bg-slate-900"
                            : "border-slate-700/80 bg-slate-900/80"
                        }`}
                        key={item.id}
                        style={{ animationDelay: `${180 + itemIndex * 45}ms` }}
                      >
                        {item.image ? (
                          <MenuImage
                            alt={translation?.item_name || "menu item"}
                            className="mb-3 h-44 w-full rounded-xl object-cover"
                            wrapperClassName="mb-3 rounded-xl"
                            src={apiFileUrl(item.image)}
                          />
                        ) : null}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{translation?.item_name || "Unnamed Item"}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-slate-400">
                              {translation?.description || ""}
                            </p>
                          </div>
                          <strong className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                            {formatPrice(item.price)}
                          </strong>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
