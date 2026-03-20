import { useMemo, useState } from "react";
import MenuImage from "../components/MenuImage";
import { apiFileUrl } from "../lib/api";
import { formatPrice, getItemTranslation } from "../lib/menuThemeUtils";

const WAITRESS_SECTION_ID = "call-waitress";

export default function FastFoodTheme({ menu, languageCode, onLanguageChange, colorPalette }) {
  void colorPalette;
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
          categoryName: category.name
        }))
      ),
    [menu]
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

  return (
    <div className="bg-slate-50 text-slate-900">
      <header className="menu-reveal sticky top-0 z-20 bg-slate-50/80 backdrop-blur">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-200 bg-white/95 px-5 py-2 sm:px-8 lg:px-12">
          <div />
          <div className="flex items-center gap-3 justify-self-center">
            <BrandIcon brandIcon={menu.brand_icon} restaurantName={menu.restaurant_name} />
            <div className="text-center">
              <p className="menu-display-street text-2xl uppercase leading-none text-slate-900 sm:text-3xl">
                {menu.restaurant_name}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-self-end gap-3 sm:gap-4">
            <select
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-rose-400"
              onChange={(e) => onLanguageChange?.(e.target.value)}
              value={languageCode}
            >
              {menu.supported_languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
            <CartDropdown
              languageCode={languageCode}
              lineItems={lineItems}
              onReset={resetEstimator}
              onUpdateQty={changeQty}
              totalAmount={totalAmount}
            />
          </div>
        </div>
      </header>

      <section className="menu-reveal relative mb-8 overflow-hidden border-b border-slate-200 bg-white shadow-lg">
        <div style={heroSizingStyle}>
          {heroImage ? (
            <MenuImage
              alt={menu.restaurant_name}
              className="h-full w-full object-cover"
              src={heroImage.startsWith("/uploads/") ? apiFileUrl(heroImage) : heroImage}
              wrapperClassName="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-200">
              <PhotoPlaceholder />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-5 text-white sm:p-7">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="menu-display-street text-4xl uppercase leading-tight text-white drop-shadow sm:text-5xl">
              {menu.restaurant_name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100 sm:text-base">
            {menu.shop_description || "Fresh food, bold flavors, and quick service every day."}
            </p>
            <a
              className="mt-5 inline-flex rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
              href={`#${WAITRESS_SECTION_ID}`}
            >
              Call a Waitress
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <section className="menu-reveal mb-8">
          <div className="mb-3">
            <h2 className="menu-display-street text-3xl uppercase text-slate-900">Categories</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.categories.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        </section>

        <section className="menu-reveal mb-8">
          <div className="mb-3">
            <h2 className="menu-display-street text-3xl uppercase text-slate-900">Most Popular & Recent</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentItems.map((item) => {
              const translation = getItemTranslation(item, languageCode);
              const qty = Number(qtyByItemId[item.id] || 0);
              return (
                <article className="menu-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={item.id}>
                  {item.image ? (
                    <MenuImage
                      alt={translation?.item_name || "menu item"}
                      className="h-40 w-full object-cover"
                      src={apiFileUrl(item.image)}
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-rose-100 to-fuchsia-100 text-rose-500">
                      <PhotoPlaceholder />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {translation?.item_name || "Unnamed Item"}
                        </h3>
                        <p className="text-xs uppercase tracking-wide text-slate-500">{item.categoryName}</p>
                      </div>
                      <strong className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {translation?.description || "Chef special fast-food favorite."}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold uppercase text-rose-700">
                        Recent
                      </span>
                      <div className="flex items-center gap-2">
                        {qty > 0 ? <span className="text-xs font-semibold text-slate-600">{qty} in cart</span> : null}
                        <button
                          className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600"
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

        <section className="menu-reveal mb-8" id={WAITRESS_SECTION_ID}>
          <div className="rounded-3xl border border-rose-200 bg-white p-6 text-slate-900 shadow-sm">
            <h2 className="menu-display-street mt-1 text-3xl uppercase text-slate-900">Call a Waitress</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Need help with recommendations, extras, or table service? Tap the button below.
            </p>
            <button
              className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              type="button"
            >
              Call Waitress
            </button>
          </div>
        </section>

      </div>
      <footer className="menu-reveal border-y border-slate-800 bg-slate-950 py-6 shadow-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <h3 className="menu-display-street text-2xl uppercase text-white">Contact & Address</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-100">Phone:</span>{" "}
              {menu.contact_phone || "Not provided yet"}
            </p>
            <p>
              <span className="font-semibold text-slate-100">Email:</span>{" "}
              {menu.contact_email || "Not provided yet"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-slate-100">Address:</span>{" "}
              {menu.address_line || "Not provided yet"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CartDropdown({ lineItems, totalAmount, onUpdateQty, onReset, languageCode }) {
  const [isOpen, setIsOpen] = useState(false);
  const totalCount = lineItems.reduce((sum, entry) => sum + entry.qty, 0);
  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-label="Open cart"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <CartIcon />
        {totalCount ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {totalCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <aside className="absolute right-0 top-12 z-30 w-[300px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Order Card</p>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              {totalCount} items
            </span>
          </div>
          <div className="mt-2 max-h-56 space-y-2 overflow-auto">
            {lineItems.length ? (
              lineItems.map(({ item, qty }) => (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {getItemTranslation(item, languageCode)?.item_name || `Item #${item.id}`}
                    </p>
                    <p className="text-[11px] text-slate-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      className="h-6 w-6 rounded-full border border-slate-300 text-xs text-slate-700"
                      onClick={() => onUpdateQty(item.id, -1)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{qty}</span>
                    <button
                      className="h-6 w-6 rounded-full bg-rose-500 text-xs text-white"
                      onClick={() => onUpdateQty(item.id, 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No items yet.</p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
            <p className="text-xs font-semibold text-slate-600">Total</p>
            <p className="text-sm font-extrabold text-slate-900">{formatPrice(totalAmount)}</p>
          </div>
          <button
            className="mt-2 w-full rounded-md border border-slate-300 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            onClick={onReset}
            type="button"
          >
            Clear Cart
          </button>
        </aside>
      ) : null}
    </div>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 5h2l2.2 9.2a1 1 0 0 0 1 .8H18a1 1 0 0 0 1-.8L21 7H7" />
      <circle cx="10" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  );
}

function BrandIcon({ brandIcon, restaurantName }) {
  if (brandIcon) {
    return (
      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-lg font-black uppercase text-white shadow-sm">
      {restaurantName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)}
    </div>
  );
}

function CategoryTile({ category }) {
  const imagePath = category.image || category.items.find((item) => item.image)?.image || "";
  const shortDescription = category.short_description || `${category.items.length} items available`;

  return (
    <article className="menu-card group relative h-52 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      {imagePath ? (
        <MenuImage
          alt={category.name}
          className="h-full w-full object-cover"
          src={imagePath.startsWith("/uploads/") ? apiFileUrl(imagePath) : imagePath}
          wrapperClassName="h-full w-full"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-100 to-fuchsia-100 text-rose-400">
          <PhotoPlaceholder />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 px-4 text-center">
        <h3 className="menu-display-street text-3xl uppercase text-white drop-shadow">{category.name}</h3>
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/85 via-black/70 to-transparent p-3 text-sm text-slate-100 transition-transform duration-300 group-hover:translate-y-0">
        {shortDescription}
      </div>
    </article>
  );
}

function PhotoPlaceholder() {
  return (
    <svg aria-hidden="true" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m7 17 4-4 3 3 3-2 2 3" />
    </svg>
  );
}
