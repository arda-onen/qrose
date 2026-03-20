import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFileUrl, apiRequest } from "../lib/api";
import { THEME_OPTIONS, normalizeThemeKey } from "../themes/themeStyles";

export default function RestaurantDashboard() {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [itemForm, setItemForm] = useState({
    category_id: "",
    price: "",
    item_name: "",
    description: "",
    image: null
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    short_description: "",
    image: null
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [brandIconFile, setBrandIconFile] = useState(null);

  async function loadMenu() {
    try {
      const data = await apiRequest("/restaurant/menu");
      setMenu(data);
      setError("");
      if (!itemForm.category_id && data.categories[0]) {
        setItemForm((prev) => ({ ...prev, category_id: String(data.categories[0].id) }));
      }
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function saveMenuMeta(event) {
    event.preventDefault();
    try {
      await apiRequest("/restaurant/menu", {
        method: "PUT",
        body: JSON.stringify({
          name: menu.name,
          restaurant_name: menu.restaurant_name,
          theme: normalizeThemeKey(menu.theme),
          shop_description: menu.shop_description || "",
          contact_phone: menu.contact_phone || "",
          contact_email: menu.contact_email || "",
          address_line: menu.address_line || "",
          supported_languages: menu.supported_languages
        })
      });
      setNotice("Settings saved.");
      await loadMenu();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function uploadBrandIcon(event) {
    event.preventDefault();
    if (!brandIconFile) {
      setError("Select a brand icon first.");
      return;
    }
    try {
      const body = new FormData();
      body.append("image", brandIconFile);
      await apiRequest("/restaurant/menu/brand-icon", { method: "POST", body });
      setBrandIconFile(null);
      setNotice("Brand icon uploaded.");
      await loadMenu();
    } catch (uploadError) {
      setError(uploadError.message);
    }
  }

  async function uploadHeroImage(event) {
    event.preventDefault();
    if (!heroImageFile) {
      setError("Select a hero image first.");
      return;
    }
    try {
      const body = new FormData();
      body.append("image", heroImageFile);
      await apiRequest("/restaurant/menu/hero-image", { method: "POST", body });
      setHeroImageFile(null);
      setNotice("Hero image uploaded.");
      await loadMenu();
    } catch (uploadError) {
      setError(uploadError.message);
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    try {
      const body = new FormData();
      body.append("name", categoryForm.name);
      body.append("short_description", categoryForm.short_description);
      if (categoryForm.image) {
        body.append("image", categoryForm.image);
      }
      await apiRequest("/restaurant/categories", { method: "POST", body });
      setCategoryForm({ name: "", short_description: "", image: null });
      setNotice("Category added.");
      await loadMenu();
    } catch (addError) {
      setError(addError.message);
    }
  }

  async function deleteCategory(categoryId) {
    try {
      await apiRequest(`/restaurant/categories/${categoryId}`, { method: "DELETE" });
      setNotice("Category deleted.");
      await loadMenu();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function addItem(event) {
    event.preventDefault();
    try {
      const body = new FormData();
      body.append("category_id", itemForm.category_id);
      body.append("price", itemForm.price);
      const defaultLanguageCode = menu.supported_languages[0] || "en";
      body.append(
        "translations",
        JSON.stringify([
          {
            language_code: defaultLanguageCode,
            item_name: itemForm.item_name,
            description: itemForm.description
          }
        ])
      );
      if (itemForm.image) {
        body.append("image", itemForm.image);
      }
      await apiRequest("/restaurant/items", { method: "POST", body });
      setItemForm((prev) => ({
        ...prev,
        price: "",
        item_name: "",
        description: "",
        image: null
      }));
      setNotice("Item added.");
      await loadMenu();
    } catch (addError) {
      setError(addError.message);
    }
  }

  async function deleteItem(itemId) {
    try {
      await apiRequest(`/restaurant/items/${itemId}`, { method: "DELETE" });
      setNotice("Item deleted.");
      await loadMenu();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!menu) {
    return (
      <DashboardLayout title="Restaurant Dashboard">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const allItems = menu.categories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryName: category.name
    }))
  );

  return (
    <DashboardLayout title="Restaurant Dashboard">
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Menu Management</h2>
          <p className="mt-1 text-sm text-slate-600">Simple tools for settings, images, categories, and items.</p>
        </div>

        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p> : null}

        <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveMenuMeta}>
          <h3 className="text-lg font-semibold text-slate-900">Menu Settings</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-md border border-slate-300 p-2.5"
              onChange={(e) => setMenu((m) => ({ ...m, name: e.target.value }))}
              placeholder="Menu name"
              value={menu.name}
            />
            <input
              className="rounded-md border border-slate-300 p-2.5"
              onChange={(e) => setMenu((m) => ({ ...m, restaurant_name: e.target.value }))}
              placeholder="Restaurant name"
              value={menu.restaurant_name}
            />
            <select
              className="rounded-md border border-slate-300 p-2.5"
              onChange={(e) => setMenu((m) => ({ ...m, theme: normalizeThemeKey(e.target.value) }))}
              value={normalizeThemeKey(menu.theme)}
            >
              {THEME_OPTIONS.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-slate-300 p-2.5"
              onChange={(e) =>
                setMenu((m) => ({
                  ...m,
                  supported_languages: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                }))
              }
              placeholder="Languages: en,tr,de"
              value={menu.supported_languages.join(",")}
            />
            <input
              className="rounded-md border border-slate-300 p-2.5"
              onChange={(e) => setMenu((m) => ({ ...m, contact_phone: e.target.value }))}
              placeholder="Contact phone"
              value={menu.contact_phone || ""}
            />
            <input
              className="rounded-md border border-slate-300 p-2.5"
              onChange={(e) => setMenu((m) => ({ ...m, contact_email: e.target.value }))}
              placeholder="Contact email"
              value={menu.contact_email || ""}
            />
            <input
              className="rounded-md border border-slate-300 p-2.5 md:col-span-2"
              onChange={(e) => setMenu((m) => ({ ...m, address_line: e.target.value }))}
              placeholder="Address"
              value={menu.address_line || ""}
            />
            <textarea
              className="rounded-md border border-slate-300 p-2.5 md:col-span-2"
              onChange={(e) => setMenu((m) => ({ ...m, shop_description: e.target.value }))}
              placeholder="Shop description"
              rows={3}
              value={menu.shop_description || ""}
            />
          </div>
          <button className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" type="submit">
            Save Settings
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={uploadBrandIcon}>
            <h3 className="text-lg font-semibold text-slate-900">Brand Icon Upload</h3>
            <input
              className="mt-3 w-full text-sm"
              onChange={(e) => setBrandIconFile(e.target.files?.[0] || null)}
              type="file"
            />
            <button className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" type="submit">
              Upload Brand Icon
            </button>
            {menu.brand_icon ? (
              <img
                alt="Brand icon"
                className="mt-3 h-20 w-20 rounded-xl border object-cover"
                src={menu.brand_icon.startsWith("/uploads/") ? apiFileUrl(menu.brand_icon) : menu.brand_icon}
              />
            ) : null}
          </form>

          <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={uploadHeroImage}>
            <h3 className="text-lg font-semibold text-slate-900">Hero Image Upload</h3>
            <input
              className="mt-3 w-full text-sm"
              onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
              type="file"
            />
            <button className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" type="submit">
              Upload Hero Image
            </button>
            {menu.hero_image ? (
              <img
                alt="Hero"
                className="mt-3 h-28 w-full rounded-xl border object-cover"
                src={menu.hero_image.startsWith("/uploads/") ? apiFileUrl(menu.hero_image) : menu.hero_image}
              />
            ) : null}
          </form>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={addCategory}>
            <h3 className="text-lg font-semibold text-slate-900">Add Category</h3>
            <div className="mt-3 space-y-3">
              <input
                className="w-full rounded-md border border-slate-300 p-2.5"
                onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Category name"
                required
                value={categoryForm.name}
              />
              <textarea
                className="w-full rounded-md border border-slate-300 p-2.5"
                onChange={(e) => setCategoryForm((f) => ({ ...f, short_description: e.target.value }))}
                placeholder="Category short description"
                rows={2}
                value={categoryForm.short_description}
              />
              <input
                className="w-full text-sm"
                onChange={(e) => setCategoryForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                type="file"
              />
              <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" type="submit">
                Add Category
              </button>
            </div>
          </form>

          <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={addItem}>
            <h3 className="text-lg font-semibold text-slate-900">Add Item</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select
                className="rounded-md border border-slate-300 p-2.5"
                onChange={(e) => setItemForm((f) => ({ ...f, category_id: e.target.value }))}
                required
                value={itemForm.category_id}
              >
                <option value="">Select category</option>
                {menu.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                className="rounded-md border border-slate-300 p-2.5"
                onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="Price"
                required
                step="0.01"
                type="number"
                value={itemForm.price}
              />
              <input
                className="rounded-md border border-slate-300 p-2.5"
                onChange={(e) => setItemForm((f) => ({ ...f, item_name: e.target.value }))}
                placeholder="Item name"
                required
                value={itemForm.item_name}
              />
              <p className="self-center text-xs text-slate-500">
                Item text saves in default language: {(menu.supported_languages[0] || "en").toUpperCase()}
              </p>
              <textarea
                className="rounded-md border border-slate-300 p-2.5 md:col-span-2"
                onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                rows={2}
                value={itemForm.description}
              />
              <input
                className="md:col-span-2 text-sm"
                onChange={(e) => setItemForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                type="file"
              />
              <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 md:col-span-2" type="submit">
                Add Item
              </button>
            </div>
          </form>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2">Items</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menu.categories.map((category) => (
                  <CategoryRow
                    category={category}
                    key={category.id}
                    onDeleteCategory={deleteCategory}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Items</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Sort</th>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item) => (
                  <ItemRow
                    item={item}
                    key={item.id}
                    onDeleteItem={deleteItem}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function CategoryRow({ category, onDeleteCategory }) {
  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-3 py-2 font-medium text-slate-900">{category.name}</td>
      <td className="px-3 py-2 text-slate-600">{category.short_description || "-"}</td>
      <td className="px-3 py-2">
        {category.image ? (
          <img
            alt={category.name}
            className="h-14 w-20 rounded-md border object-cover"
            src={category.image.startsWith("/uploads/") ? apiFileUrl(category.image) : category.image}
          />
        ) : (
          <span className="text-xs text-slate-400">No image</span>
        )}
      </td>
      <td className="px-3 py-2 text-slate-600">{category.items.length}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
            to={`/restaurant/categories/${category.id}/edit`}
          >
            Edit
          </Link>
          <button
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
            onClick={() => onDeleteCategory(category.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function ItemRow({ item, onDeleteItem }) {
  const itemName = item.translations?.[0]?.item_name || `Item #${item.id}`;

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-3 py-2 font-medium text-slate-900">{itemName}</td>
      <td className="px-3 py-2 text-slate-600">{item.categoryName}</td>
      <td className="px-3 py-2 text-slate-700">${Number(item.price).toFixed(2)}</td>
      <td className="px-3 py-2 text-slate-600">{item.sort_order ?? 0}</td>
      <td className="px-3 py-2">
        {item.image ? (
          <img
            alt={itemName}
            className="h-14 w-20 rounded-md border object-cover"
            src={item.image.startsWith("/uploads/") ? apiFileUrl(item.image) : item.image}
          />
        ) : (
          <span className="text-xs text-slate-400">No image</span>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
            to={`/restaurant/items/${item.id}/edit`}
          >
            Edit
          </Link>
          <button
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
            onClick={() => onDeleteItem(item.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
