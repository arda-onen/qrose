import { useMemo, useState } from "react";
import MenuImage from "../components/MenuImage";
import { apiFileUrl } from "../lib/api";
import {
  categoryAnchor,
  formatPrice,
  getCategoryTranslation,
  getItemTranslation
} from "../lib/menuThemeUtils";
import { useParallaxOffset } from "../lib/useParallaxOffset";
import { normalizePaletteKey } from "./themeStyles";

const WAITRESS_SECTION_ID = "call-waitress";
const SECTION_CATEGORIES = "section-categories";
const SECTION_RECENT = "section-recent";
const SECTION_MENU = "section-menu";

const restaurantPalette = {
  sunset: {
    page: "min-h-screen bg-zinc-950 text-zinc-100",
    pageGlow: "bg-orange-500/25",
    header: "border-b border-orange-950/50 bg-zinc-950/90 backdrop-blur-xl",
    navActive: "border-orange-400/80 bg-orange-500/15 text-orange-200",
    navIdle:
      "border-zinc-800/80 bg-zinc-900/70 text-zinc-300 hover:border-orange-500/45 hover:text-orange-200",
    title: "text-orange-50",
    divider: "border-orange-900/45",
    price: "bg-orange-500/15 text-orange-100 ring-1 ring-orange-500/25",
    accent: "bg-orange-600 text-white shadow-lg shadow-orange-950/40 hover:bg-orange-500",
    accentSoft: "bg-orange-500/15 text-orange-200 ring-1 ring-orange-500/30",
    cartBadge: "bg-orange-500",
    card: "border-white/10 bg-zinc-900/55",
    select:
      "rounded-lg border border-zinc-700/90 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 outline-none focus:border-orange-500/80",
    heroRing: "ring-1 ring-orange-500/20",
    brandFallback: "from-orange-600 to-amber-600",
    dropdown: "border-zinc-700 bg-zinc-900 text-zinc-100",
    dropdownMuted: "bg-zinc-800/80 text-zinc-400",
    footer: "border-t border-orange-950/40 bg-black/55"
  },
  emerald: {
    page: "min-h-screen bg-zinc-950 text-zinc-100",
    pageGlow: "bg-emerald-500/20",
    header: "border-b border-emerald-950/45 bg-zinc-950/90 backdrop-blur-xl",
    navActive: "border-emerald-400/80 bg-emerald-500/15 text-emerald-200",
    navIdle:
      "border-zinc-800/80 bg-zinc-900/70 text-zinc-300 hover:border-emerald-500/45 hover:text-emerald-200",
    title: "text-emerald-50",
    divider: "border-emerald-900/45",
    price: "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/25",
    accent: "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500",
    accentSoft: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30",
    cartBadge: "bg-emerald-500",
    card: "border-white/10 bg-zinc-900/55",
    select:
      "rounded-lg border border-zinc-700/90 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 outline-none focus:border-emerald-500/80",
    heroRing: "ring-1 ring-emerald-500/20",
    brandFallback: "from-emerald-600 to-teal-600",
    dropdown: "border-zinc-700 bg-zinc-900 text-zinc-100",
    dropdownMuted: "bg-zinc-800/80 text-zinc-400",
    footer: "border-t border-emerald-950/40 bg-black/55"
  },
  royal: {
    page: "min-h-screen bg-zinc-950 text-zinc-100",
    pageGlow: "bg-indigo-500/20",
    header: "border-b border-indigo-950/45 bg-zinc-950/90 backdrop-blur-xl",
    navActive: "border-indigo-400/80 bg-indigo-500/15 text-indigo-200",
    navIdle:
      "border-zinc-800/80 bg-zinc-900/70 text-zinc-300 hover:border-indigo-500/45 hover:text-indigo-200",
    title: "text-indigo-50",
    divider: "border-indigo-900/45",
    price: "bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-500/25",
    accent: "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500",
    accentSoft: "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/30",
    cartBadge: "bg-indigo-500",
    card: "border-white/10 bg-zinc-900/55",
    select:
      "rounded-lg border border-zinc-700/90 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 outline-none focus:border-indigo-500/80",
    heroRing: "ring-1 ring-indigo-500/20",
    brandFallback: "from-indigo-600 to-violet-600",
    dropdown: "border-zinc-700 bg-zinc-900 text-zinc-100",
    dropdownMuted: "bg-zinc-800/80 text-zinc-400",
    footer: "border-t border-indigo-950/40 bg-black/55"
  }
};

export default function RestaurantTheme({
  menu,
  languageCode,
  onLanguageChange,
  activeCategoryId,
  colorPalette
}) {
  const palette = restaurantPalette[normalizePaletteKey(colorPalette)];
  const glowStyle = useParallaxOffset(0.04, 20);

  const heroSizingStyle = {
    height: "calc(100dvh - 70px)",
    minHeight: "calc(100vh - 90px)"
  };

  const allItems = useMemo(
    () =>
      menu.categories.flatMap((category) =>
        category.items.map((item) => ({
          ...item,
          categoryId: category.id,
          categoryName: getCategoryTranslation(category, languageCode).name
        }))
      ),
    [menu, languageCode]
  );

  const recentItems = useMemo(
    () =>
      [...allItems]
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime() ||
            Number(b.id) - Number(a.id)
        )
        .slice(0, 8),
    [allItems]
  );

  const heroImage = useMemo(
    () => menu.hero_image || allItems.find((item) => item.image)?.image || null,
    [menu.hero_image, allItems]
  );

  const [qtyByItemId, setQtyByItemId] = useState({});

  const lineItems = useMemo(
    () =>
      allItems
        .map((item) => ({
          item,
          qty: Number(qtyByItemId[item.id] || 0)
        }))
        .filter((entry) => entry.qty > 0),
    [allItems, qtyByItemId]
  );

  const totalAmount = useMemo(
    () => lineItems.reduce((sum, entry) => sum + Number(entry.item.price || 0) * entry.qty, 0),
    [lineItems]
  );

  function changeQty(itemId, delta) {
    setQtyByItemId((prev) => {
      const next = Math.max(0, Number(prev[itemId] || 0) + delta);
      if (!next) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  }

  function resetEstimator() {
    setQtyByItemId({});
  }

  const heroDescription =
    menu.shop_description?.trim() ||
    "Seasonal ingredients, warm hospitality, and a dining room made for lingering.";

  return (
    <div className={palette.page}>
      <header className={`menu-reveal sticky top-0 z-20 ${palette.header}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <RestaurantBrandIcon
              accentClass={palette.brandFallback}
              brandIcon={menu.brand_icon}
              restaurantName={menu.restaurant_name}
            />
            <div className="min-w-0">
              <p className="truncate font-medium tracking-wide text-zinc-100">{menu.restaurant_name}</p>
              <p className="truncate text-[11px] uppercase tracking-[0.2em] text-zinc-500">{menu.name}</p>
            </div>
          </div>
          <nav className="menu-reveal-soft hidden flex-none items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 md:flex">
            <a className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-zinc-200" href={`#${SECTION_CATEGORIES}`}>
              Explore
            </a>
            <a className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-zinc-200" href={`#${SECTION_RECENT}`}>
              Featured
            </a>
            <a className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-zinc-200" href={`#${SECTION_MENU}`}>
              Menu
            </a>
            <a className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-zinc-200" href={`#${WAITRESS_SECTION_ID}`}>
              Service
            </a>
            <a className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-zinc-200" href="#section-contact">
              Contact
            </a>
          </nav>
          <div className="flex flex-none items-center gap-2 sm:gap-3">
            <select
              className={palette.select}
              onChange={(e) => onLanguageChange?.(e.target.value)}
              value={languageCode}
            >
              {menu.supported_languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
            <RestaurantCartDropdown
              accentBadgeClass={palette.cartBadge}
              accentBtnClass={palette.accent}
              dropdownClass={palette.dropdown}
              dropdownMutedClass={palette.dropdownMuted}
              languageCode={languageCode}
              lineItems={lineItems}
              onReset={resetEstimator}
              onUpdateQty={changeQty}
              totalAmount={totalAmount}
            />
          </div>
        </div>
      </header>

      <section className="menu-reveal relative overflow-hidden border-b border-white/5">
        <div style={heroSizingStyle}>
          {heroImage ? (
            <MenuImage
              alt={menu.restaurant_name}
              className="h-full w-full object-cover"
              src={heroImage.startsWith("/uploads/") ? apiFileUrl(heroImage) : heroImage}
              wrapperClassName="h-full"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${palette.brandFallback} opacity-90`}
            >
              <PhotoPlaceholder className="text-white/90" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-zinc-950" />
        <div className={`pointer-events-none absolute -left-16 top-24 h-40 w-40 rounded-full blur-3xl ${palette.pageGlow}`} style={glowStyle} />

        <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
          <div
            className={`menu-reveal relative mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center shadow-2xl backdrop-blur-md sm:p-10 ${palette.heroRing}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">Est.</p>
            <h1 className="menu-display-luxury mt-3 text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
              {menu.restaurant_name}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-200 sm:text-base">{heroDescription}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-7 py-2.5 text-sm font-semibold transition ${palette.accent}`}
                href={`#${SECTION_MENU}`}
              >
                View the menu
              </a>
              <a
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                href={`#${WAITRESS_SECTION_ID}`}
              >
                Request table service
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-3 pb-16 sm:px-4">
        <section className="menu-reveal mt-10" id={SECTION_CATEGORIES}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">Discover</p>
              <h2 className={`menu-display-luxury mt-1 text-3xl sm:text-4xl ${palette.title}`}>Our offerings</h2>
            </div>
            <p className="max-w-md text-sm text-zinc-400">
              Browse by mood—each collection is curated from your live menu categories.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.categories.map((category) => (
              <RestaurantCategoryTile
                accentClass={palette.brandFallback}
                category={category}
                key={category.id}
                languageCode={languageCode}
              />
            ))}
          </div>
        </section>

        <section className="menu-reveal mt-14" id={SECTION_RECENT}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">Chef&apos;s window</p>
              <h2 className={`menu-display-luxury mt-1 text-3xl sm:text-4xl ${palette.title}`}>Most popular & recent</h2>
            </div>
            <p className="max-w-md text-sm text-zinc-400">New arrivals and spotlight dishes from your kitchen, refreshed automatically.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentItems.map((item) => {
              const translation = getItemTranslation(item, languageCode);
              const qty = Number(qtyByItemId[item.id] || 0);
              return (
                <article
                  className={`menu-card overflow-hidden rounded-2xl border shadow-lg shadow-black/20 ${palette.card}`}
                  key={item.id}
                >
                  {item.image ? (
                    <MenuImage
                      alt={translation?.item_name || "menu item"}
                      className="menu-image h-44 w-full object-cover sm:h-48"
                      src={apiFileUrl(item.image)}
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-zinc-800/90 sm:h-48">
                      <PhotoPlaceholder className="text-zinc-600" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="menu-display-luxury text-xl text-zinc-50">
                          {translation?.item_name || "Unnamed Item"}
                        </h3>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">{item.categoryName}</p>
                      </div>
                      <strong className={`shrink-0 rounded-full px-3 py-1 text-sm ${palette.price}`}>
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {translation?.description || "A signature plate from tonight's menu."}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${palette.accentSoft}`}>
                        Recent
                      </span>
                      <div className="flex items-center gap-2">
                        {qty > 0 ? <span className="text-xs font-semibold text-zinc-400">{qty} in cart</span> : null}
                        <button
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${palette.accent}`}
                          onClick={() => changeQty(item.id, 1)}
                          type="button"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div
          className="menu-reveal-soft sticky top-[52px] z-10 mt-12 hidden overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/75 p-2 shadow-lg shadow-black/20 backdrop-blur-md md:block"
        >
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

        <div className="menu-reveal mt-12" id={SECTION_MENU}>
          <div className="mb-8 border-b border-white/10 pb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">The dining room</p>
            <h2 className={`menu-display-luxury mt-2 text-3xl sm:text-4xl ${palette.title}`}>A la carte</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Full menu service with imagery, pricing, and notes—presented like a restaurant website, powered by your QR menu data.
            </p>
          </div>
        </div>

        {menu.categories.map((category, categoryIndex) => (
          <section
            className="menu-reveal mt-10 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32"
            id={categoryAnchor(category.id)}
            key={category.id}
            style={{ animationDelay: `${120 + categoryIndex * 70}ms` }}
          >
            <h2 className={`mb-6 border-b pb-3 text-2xl sm:text-3xl ${palette.divider} menu-display-luxury ${palette.title}`}>
              {getCategoryTranslation(category, languageCode).name}
            </h2>
            {category.items[0]?.image ? (
              <MenuImage
                alt={getCategoryTranslation(category, languageCode).name}
                className="mb-4 h-48 w-full rounded-2xl object-cover sm:h-52"
                src={apiFileUrl(category.items[0].image)}
                wrapperClassName="mb-4 rounded-2xl border border-white/10"
              />
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item, itemIndex) => {
                const translation = getItemTranslation(item, languageCode);
                const reverseLayout = itemIndex % 2 === 1;
                const qty = Number(qtyByItemId[item.id] || 0);

                return (
                  <article
                    className={`menu-card menu-reveal overflow-hidden rounded-2xl border ${palette.card}`}
                    key={item.id}
                    style={{ animationDelay: `${170 + itemIndex * 50}ms` }}
                  >
                    <div className={`grid items-stretch lg:grid-cols-2 ${reverseLayout ? "lg:[&>*:first-child]:order-2" : ""}`}>
                      {item.image ? (
                        <MenuImage
                          alt={translation?.item_name || "menu item"}
                          className="menu-image h-52 w-full object-cover lg:h-60"
                          wrapperClassName="h-52 lg:h-60"
                          src={apiFileUrl(item.image)}
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 lg:h-60">
                          <PhotoPlaceholder className="text-zinc-600" />
                        </div>
                      )}
                      <div className="flex flex-col justify-between p-5">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="menu-display-luxury text-2xl text-zinc-50">
                              {translation?.item_name || "Unnamed Item"}
                            </h3>
                            <strong className={`shrink-0 rounded-full px-3 py-1 text-sm ${palette.price}`}>
                              {formatPrice(item.price)}
                            </strong>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                            {translation?.description || ""}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">On the menu</p>
                          <div className="flex items-center gap-2">
                            {qty > 0 ? <span className="text-xs font-semibold text-zinc-400">{qty} in cart</span> : null}
                            <button
                              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${palette.accent}`}
                              onClick={() => changeQty(item.id, 1)}
                              type="button"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}


        <section className="menu-reveal mt-16 scroll-mt-28" id={WAITRESS_SECTION_ID}>
          <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-8 shadow-xl shadow-black/30 sm:p-10">
            <h2 className={`menu-display-luxury text-3xl ${palette.title}`}>Call a waitress</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Need wine pairings, dietary adjustments, or another round? Our hosting team is one tap away.
            </p>
            <button
              className={`mt-6 rounded-full px-6 py-2.5 text-sm font-semibold transition ${palette.accent}`}
              type="button"
            >
              Call waitress
            </button>
          </div>
        </section>
      </div>

      <footer className={`menu-reveal py-10 ${palette.footer}`} id="section-contact">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <h3 className={`menu-display-luxury text-2xl sm:text-3xl ${palette.title}`}>Visit & contact</h3>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Reserve a table by phone or email—we will hold the best table for you.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-zinc-100">Phone:</span>{" "}
              {menu.contact_phone || "Not provided yet"}
            </p>
            <p>
              <span className="font-semibold text-zinc-100">Email:</span>{" "}
              {menu.contact_email || "Not provided yet"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-zinc-100">Address:</span>{" "}
              {menu.address_line || "Not provided yet"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RestaurantCartDropdown({
  lineItems,
  totalAmount,
  onUpdateQty,
  onReset,
  languageCode,
  accentBadgeClass,
  accentBtnClass,
  dropdownClass,
  dropdownMutedClass
}) {
  const [isOpen, setIsOpen] = useState(false);
  const totalCount = lineItems.reduce((sum, entry) => sum + entry.qty, 0);
  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-label="Open cart"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-zinc-200 shadow-md transition hover:bg-zinc-800"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <CartIcon />
        {totalCount ? (
          <span className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${accentBadgeClass}`}>
            {totalCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <aside className={`absolute right-0 top-12 z-30 w-[min(100vw-1.5rem,300px)] rounded-xl border p-3 shadow-2xl shadow-black/40 ${dropdownClass}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Order card</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${dropdownMutedClass}`}>{totalCount} items</span>
          </div>
          <div className="mt-2 max-h-56 space-y-2 overflow-auto">
            {lineItems.length ? (
              lineItems.map(({ item, qty }) => (
                <div className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${dropdownMutedClass}`} key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-100">
                      {getItemTranslation(item, languageCode)?.item_name || `Item #${item.id}`}
                    </p>
                    <p className="text-[11px] text-zinc-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      className="h-7 w-7 rounded-full border border-zinc-600 text-xs text-zinc-200"
                      onClick={() => onUpdateQty(item.id, -1)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{qty}</span>
                    <button
                      className={`h-7 w-7 rounded-full text-xs text-white ${accentBtnClass}`}
                      onClick={() => onUpdateQty(item.id, 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No items yet.</p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2">
            <p className="text-xs font-semibold text-zinc-400">Total</p>
            <p className="text-sm font-extrabold text-zinc-50">{formatPrice(totalAmount)}</p>
          </div>
          <button
            className="mt-2 w-full rounded-md border border-zinc-600 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            onClick={onReset}
            type="button"
          >
            Clear cart
          </button>
        </aside>
      ) : null}
    </div>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 5h2l2.2 9.2a1 1 0 0 0 1 .8H18a1 1 0 0 0 1-.8L21 7H7" />
      <circle cx="10" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  );
}

function RestaurantBrandIcon({ brandIcon, restaurantName, accentClass }) {
  if (brandIcon) {
    return (
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-lg shadow-black/30 sm:h-14 sm:w-14">
        <MenuImage
          alt={`${restaurantName} icon`}
          className="h-full w-full object-cover"
          src={brandIcon.startsWith("/uploads/") ? apiFileUrl(brandIcon) : brandIcon}
          wrapperClassName="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold uppercase text-white shadow-lg shadow-black/30 sm:h-14 sm:w-14 ${accentClass}`}
    >
      {restaurantName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)}
    </div>
  );
}

function RestaurantCategoryTile({ category, languageCode, accentClass }) {
  const imagePath = category.image || category.items.find((i) => i.image)?.image || "";
  const cTr = getCategoryTranslation(category, languageCode);
  const shortDescription = cTr.short_description?.trim() || `${category.items.length} dishes`;

  return (
    <a className="block" href={`#${categoryAnchor(category.id)}`}>
      <article className="menu-card group relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/25">
        {imagePath ? (
          <MenuImage
            alt={cTr.name}
            className="menu-image h-full w-full object-cover"
            src={imagePath.startsWith("/uploads/") ? apiFileUrl(imagePath) : imagePath}
            wrapperClassName="h-full w-full"
          />
        ) : (
          <div className={`flex h-full items-center justify-center bg-gradient-to-br ${accentClass} opacity-90`}>
            <PhotoPlaceholder className="text-white/85" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
          <h3 className={`menu-display-luxury text-2xl sm:text-3xl ${imagePath ? "text-white drop-shadow" : "text-white"}`}>
            {cTr.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/80 opacity-0 transition duration-300 group-hover:opacity-100">
            {shortDescription}
          </p>
        </div>
      </article>
    </a>
  );
}

function PhotoPlaceholder({ className = "text-zinc-500" }) {
  return (
    <svg aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m7 17 4-4 3 3 3-2 2 3" />
    </svg>
  );
}
