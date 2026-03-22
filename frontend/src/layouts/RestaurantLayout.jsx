import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { getRestaurantPageMeta } from "../lib/restaurantPageMeta";

const navItem = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? "bg-white/12 text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

const navIcon = "h-5 w-5 shrink-0 opacity-90";

function NavIconPanel() {
  return (
    <svg aria-hidden className={navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        strokeWidth={1.5}
      />
    </svg>
  );
}
function NavIconProducts() {
  return (
    <svg aria-hidden className={navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}
function NavIconChart() {
  return (
    <svg aria-hidden className={navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}
function NavIconTable() {
  return (
    <svg aria-hidden className={navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 12h16M12 4v16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}
function NavIconSettings() {
  return (
    <svg aria-hidden className={navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}
function NavIconPlus() {
  return (
    <svg aria-hidden className={navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}

function RestaurantShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageMeta = getRestaurantPageMeta(location.pathname);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("restaurant-shell-active");
    body.classList.add("restaurant-shell-active");
    return () => {
      root.classList.remove("restaurant-shell-active");
      body.classList.remove("restaurant-shell-active");
    };
  }, []);

  return (
    <div className="box-border h-full min-h-0 w-full overflow-hidden bg-slate-100/90">
      {mobileNavOpen ? (
        <button
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-xl transition-transform duration-200 md:z-30 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="border-b border-white/10 px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/90">QRose</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Restoran</p>
          <p className="mt-1 text-xs text-slate-400">Menü yönetimi</p>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Yönetim</p>
          <NavLink className={navItem} end to="/restaurant">
            <NavIconPanel />
            Panel
          </NavLink>
          <NavLink className={navItem} to="/restaurant/products">
            <NavIconProducts />
            Ürünler
          </NavLink>
          <NavLink className={navItem} to="/restaurant/tables">
            <NavIconTable />
            Masalar
          </NavLink>
          <NavLink className={navItem} to="/restaurant/analytics">
            <NavIconChart />
            İstatistik
          </NavLink>
          <NavLink className={navItem} to="/restaurant/settings">
            <NavIconSettings />
            Menü ayarları
          </NavLink>

          <p className="mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hızlı ekle</p>
          <NavLink className={navItem} to="/restaurant/categories/new">
            <NavIconPlus />
            Kategori
          </NavLink>
          <NavLink className={navItem} to="/restaurant/items/new">
            <NavIconPlus />
            Ürün
          </NavLink>
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
          <Link
            className="block rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            to="/"
          >
            Ana sayfa
          </Link>
          <button
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            onClick={logout}
            type="button"
          >
            Çıkış
          </button>
        </div>
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden md:pl-60">
        <header className="shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm md:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Menüyü aç"
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                onClick={() => setMobileNavOpen(true)}
                type="button"
              >
                <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-slate-900"> {pageMeta.title}</h1>
                {pageMeta.subtitle ? (
                  <p className="truncate text-xs text-slate-500">{pageMeta.subtitle}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline">
                {user?.email}
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800">
                {user?.role === "restaurant" ? "Restoran" : user?.role === "admin" ? "Yönetici" : user?.role}
              </span>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-slate-50/80 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function RestaurantLayout() {
  return (
    <ToastProvider>
      <RestaurantShell />
    </ToastProvider>
  );
}
