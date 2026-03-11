import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiRequest } from "../lib/api";
import { COLOR_PALETTE_OPTIONS, THEME_OPTIONS, normalizePaletteKey, normalizeThemeKey } from "../themes/themeStyles";

const THEME_COLOR = {
  cafe: "bg-amber-100 text-amber-900 border-amber-200",
  restaurant: "bg-zinc-800 text-zinc-100 border-zinc-700",
  fast_food: "bg-orange-100 text-orange-800 border-orange-200"
};

const PALETTE_COLOR = {
  sunset: "bg-orange-100 text-orange-700 border-orange-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  royal: "bg-indigo-100 text-indigo-700 border-indigo-200"
};

export default function AdminDashboard() {
  const [menus, setMenus] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    restaurant_name: "",
    theme: "cafe",
    color_palette: "sunset",
    owner_email: "",
    owner_password: "",
    supported_languages: "en,tr,de,fr"
  });

  async function loadMenus() {
    try {
      const data = await apiRequest("/admin/menus");
      setMenus(data);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadMenus();
  }, []);

  async function createMenu(event) {
    event.preventDefault();
    try {
      await apiRequest("/admin/menus", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          theme: normalizeThemeKey(form.theme),
          color_palette: normalizePaletteKey(form.color_palette),
          supported_languages: form.supported_languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        })
      });
      setForm({
        name: "",
        restaurant_name: "",
        theme: "cafe",
        color_palette: "sunset",
        owner_email: "",
        owner_password: "",
        supported_languages: "en,tr,de,fr"
      });
      await loadMenus();
      setNotice("Menu created successfully.");
    } catch (submitError) {
      setError(submitError.message);
      setNotice("");
    }
  }

  async function deleteMenu(menuId) {
    try {
      await apiRequest(`/admin/menus/${menuId}`, { method: "DELETE" });
      await loadMenus();
      setNotice("Menu deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
      setNotice("");
    }
  }

  async function downloadQr(menuId) {
    try {
      const blob = await apiRequest(`/admin/menus/${menuId}/qr`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-${menuId}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice("QR downloaded.");
    } catch (downloadError) {
      setError(downloadError.message);
      setNotice("");
    }
  }

  async function exportMenu(menuId, slug) {
    try {
      const blob = await apiRequest(`/admin/menus/${menuId}/export`, { method: "POST" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice("Static export downloaded.");
    } catch (exportError) {
      setError(exportError.message);
      setNotice("");
    }
  }

  async function copyPublicLink(slug) {
    const url = `${window.location.origin}/menu/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setError("");
      setNotice("Public menu link copied.");
    } catch {
      setError("Could not copy the menu link.");
      setNotice("");
    }
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Control Center</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Design and launch stunning QR menus</h2>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">
          Create restaurant accounts, assign beautiful themes, generate QR codes, and export static websites.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <form
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={createMenu}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">New Menu</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Create menu + owner account</h2>
          </div>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Menu name"
            required
            value={form.name}
          />
          <input
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setForm((f) => ({ ...f, restaurant_name: e.target.value }))}
            placeholder="Restaurant name"
            required
            value={form.restaurant_name}
          />
          <select
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setForm((f) => ({ ...f, theme: normalizeThemeKey(e.target.value) }))}
            value={normalizeThemeKey(form.theme)}
          >
            {THEME_OPTIONS.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) =>
              setForm((f) => ({ ...f, color_palette: normalizePaletteKey(e.target.value) }))
            }
            value={normalizePaletteKey(form.color_palette)}
          >
            {COLOR_PALETTE_OPTIONS.map((palette) => (
              <option key={palette.value} value={palette.value}>
                {palette.label}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setForm((f) => ({ ...f, supported_languages: e.target.value }))}
            placeholder="Languages: en,tr,de,fr"
            value={form.supported_languages}
          />
          <input
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setForm((f) => ({ ...f, owner_email: e.target.value }))}
            placeholder="Restaurant user email"
            required
            type="email"
            value={form.owner_email}
          />
          <input
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            onChange={(e) => setForm((f) => ({ ...f, owner_password: e.target.value }))}
            placeholder="Restaurant user password"
            required
            type="password"
            value={form.owner_password}
          />
          <button
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            type="submit"
          >
            Create Menu
          </button>
          {error ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{notice}</p> : null}
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Management</p>
              <h2 className="text-xl font-semibold text-slate-900">Published menus</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {menus.length} total
            </span>
          </div>
          <div className="space-y-3">
            {menus.map((menu) => (
              <div
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm"
                key={menu.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{menu.restaurant_name}</p>
                    <p className="text-sm text-slate-500">{menu.slug}</p>
                    <p className="mt-1 text-sm text-slate-500">owner: {menu.owner_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        THEME_COLOR[normalizeThemeKey(menu.theme)] ||
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {normalizeThemeKey(menu.theme).replaceAll("_", " ")}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        PALETTE_COLOR[normalizePaletteKey(menu.color_palette)] ||
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {normalizePaletteKey(menu.color_palette)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    onClick={() => copyPublicLink(menu.slug)}
                    type="button"
                  >
                    Copy Public Link
                  </button>
                  <button
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900"
                    onClick={() => downloadQr(menu.id)}
                    type="button"
                  >
                    Download QR
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    onClick={() => exportMenu(menu.id, menu.slug)}
                    type="button"
                  >
                    Export ZIP
                  </button>
                  <button
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                    onClick={() => deleteMenu(menu.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!menus.length ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No menus yet. Create your first one from the panel on the left.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
