import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { AdminMenusListSkeleton } from "../components/skeletons/AdminSkeletons";
import { apiRequest } from "../lib/api";
import { THEME_OPTIONS, normalizeThemeKey } from "../themes/themeStyles";

const THEME_COLOR = {
  cafe: "bg-amber-100 text-amber-900 border-amber-200",
  restaurant: "bg-zinc-800 text-zinc-100 border-zinc-700",
  fast_food: "bg-orange-100 text-orange-800 border-orange-200"
};

export default function AdminDashboard() {
  const [menus, setMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    restaurant_name: "",
    theme: "fast_food",
    brand_icon: "",
    shop_description: "",
    contact_phone: "",
    contact_email: "",
    address_line: "",
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
    } finally {
      setMenusLoading(false);
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
          supported_languages: form.supported_languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        })
      });
      setForm({
        name: "",
        restaurant_name: "",
        theme: "fast_food",
        brand_icon: "",
        shop_description: "",
        contact_phone: "",
        contact_email: "",
        address_line: "",
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
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Manage Menus</h2>
        <p className="mt-1 text-sm text-slate-600">Create restaurant accounts and manage published menus.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <form
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          onSubmit={createMenu}
        >
          <h2 className="text-lg font-semibold text-slate-900">Create Menu</h2>
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Menu name"
            required
            value={form.name}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, restaurant_name: e.target.value }))}
            placeholder="Restaurant name"
            required
            value={form.restaurant_name}
          />
          <select
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, theme: normalizeThemeKey(e.target.value) }))}
            value={normalizeThemeKey(form.theme)}
          >
            {THEME_OPTIONS.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, supported_languages: e.target.value }))}
            placeholder="Languages: en,tr,de,fr"
            value={form.supported_languages}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, brand_icon: e.target.value }))}
            placeholder="Brand icon URL (optional)"
            value={form.brand_icon}
          />
          <textarea
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, shop_description: e.target.value }))}
            placeholder="Shop description (optional)"
            rows={2}
            value={form.shop_description}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
            placeholder="Contact phone (optional)"
            value={form.contact_phone}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
            placeholder="Contact email (optional)"
            value={form.contact_email}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
            placeholder="Address (optional)"
            value={form.address_line}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, owner_email: e.target.value }))}
            placeholder="Restaurant user email"
            required
            type="email"
            value={form.owner_email}
          />
          <input
            className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-slate-500"
            onChange={(e) => setForm((f) => ({ ...f, owner_password: e.target.value }))}
            placeholder="Restaurant user password"
            required
            type="password"
            value={form.owner_password}
          />
          <button
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Create Menu
          </button>
          {error ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{notice}</p> : null}
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Published Menus</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {menusLoading ? "…" : menus.length} total
            </span>
          </div>
          <div className="space-y-3">
            {menusLoading ? (
              <AdminMenusListSkeleton />
            ) : null}
            {!menusLoading &&
              menus.map((menu) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={menu.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{menu.restaurant_name}</p>
                    <p className="text-sm text-slate-500">{menu.slug}</p>
                    <p className="mt-1 text-sm text-slate-500">owner: {menu.owner_email}</p>
                    {menu.contact_phone ? (
                      <p className="mt-1 text-sm text-slate-500">phone: {menu.contact_phone}</p>
                    ) : null}
                    {menu.contact_email ? (
                      <p className="mt-1 text-sm text-slate-500">contact: {menu.contact_email}</p>
                    ) : null}
                    {menu.address_line ? (
                      <p className="mt-1 text-sm text-slate-500">address: {menu.address_line}</p>
                    ) : null}
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
                    {menu.brand_icon ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        icon set
                      </span>
                    ) : null}
                  </div>
                </div>
                {menu.shop_description ? (
                  <p className="mt-2 text-sm text-slate-600">{menu.shop_description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => copyPublicLink(menu.slug)}
                    type="button"
                  >
                    Copy Public Link
                  </button>
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => downloadQr(menu.id)}
                    type="button"
                  >
                    Download QR
                  </button>
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
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
            {!menusLoading && !menus.length ? (
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
