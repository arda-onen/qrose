import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiRequest } from "../lib/api";
import { COLOR_PALETTE_OPTIONS, THEME_OPTIONS, normalizePaletteKey, normalizeThemeKey } from "../themes/themeStyles";

export default function RestaurantDashboard() {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [itemForm, setItemForm] = useState({
    category_id: "",
    price: "",
    language_code: "en",
    item_name: "",
    description: "",
    image: null
  });
  const [categoryName, setCategoryName] = useState("");

  async function loadMenu() {
    try {
      const data = await apiRequest("/restaurant/menu");
      setMenu(data);
      setError("");
      if (data.categories[0]) {
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
          color_palette: normalizePaletteKey(menu.color_palette),
          supported_languages: menu.supported_languages
        })
      });
      await loadMenu();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    try {
      await apiRequest("/restaurant/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName })
      });
      setCategoryName("");
      await loadMenu();
    } catch (addError) {
      setError(addError.message);
    }
  }

  async function addItem(event) {
    event.preventDefault();
    try {
      const body = new FormData();
      body.append("category_id", itemForm.category_id);
      body.append("price", itemForm.price);
      body.append(
        "translations",
        JSON.stringify([
          {
            language_code: itemForm.language_code,
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
      await loadMenu();
    } catch (addError) {
      setError(addError.message);
    }
  }

  async function updateTranslation(itemId, languageCode, itemName, description) {
    try {
      const body = new FormData();
      body.append(
        "translations",
        JSON.stringify([{ language_code: languageCode, item_name: itemName, description }])
      );
      await apiRequest(`/restaurant/items/${itemId}`, { method: "PUT", body });
      await loadMenu();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteItem(itemId) {
    try {
      await apiRequest(`/restaurant/items/${itemId}`, { method: "DELETE" });
      await loadMenu();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!menu) {
    return (
      <DashboardLayout title="Restaurant Dashboard">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Restaurant Dashboard">
      <div className="space-y-6">
        <form className="rounded bg-white p-4 shadow" onSubmit={saveMenuMeta}>
          <h2 className="text-lg font-semibold">Menu Settings</h2>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <input
              className="rounded border p-2"
              onChange={(e) => setMenu((m) => ({ ...m, name: e.target.value }))}
              value={menu.name}
            />
            <input
              className="rounded border p-2"
              onChange={(e) =>
                setMenu((m) => ({ ...m, restaurant_name: e.target.value }))
              }
              value={menu.restaurant_name}
            />
            <select
              className="rounded border p-2"
              onChange={(e) => setMenu((m) => ({ ...m, theme: normalizeThemeKey(e.target.value) }))}
              value={normalizeThemeKey(menu.theme)}
            >
              {THEME_OPTIONS.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
            <select
              className="rounded border p-2"
              onChange={(e) =>
                setMenu((m) => ({ ...m, color_palette: normalizePaletteKey(e.target.value) }))
              }
              value={normalizePaletteKey(menu.color_palette)}
            >
              {COLOR_PALETTE_OPTIONS.map((palette) => (
                <option key={palette.value} value={palette.value}>
                  {palette.label}
                </option>
              ))}
            </select>
            <input
              className="rounded border p-2 md:col-span-2"
              onChange={(e) =>
                setMenu((m) => ({
                  ...m,
                  supported_languages: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                }))
              }
              value={menu.supported_languages.join(",")}
            />
          </div>
          <button className="mt-3 rounded bg-indigo-600 px-3 py-2 text-white" type="submit">
            Save Settings
          </button>
        </form>

        <form className="rounded bg-white p-4 shadow" onSubmit={addCategory}>
          <h2 className="text-lg font-semibold">Add Category</h2>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded border p-2"
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              required
              value={categoryName}
            />
            <button className="rounded bg-slate-800 px-3 py-2 text-white" type="submit">
              Add
            </button>
          </div>
        </form>

        <form className="rounded bg-white p-4 shadow" onSubmit={addItem}>
          <h2 className="text-lg font-semibold">Add Menu Item</h2>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <select
              className="rounded border p-2"
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
              className="rounded border p-2"
              onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="Price"
              required
              step="0.01"
              type="number"
              value={itemForm.price}
            />
            <select
              className="rounded border p-2"
              onChange={(e) => setItemForm((f) => ({ ...f, language_code: e.target.value }))}
              value={itemForm.language_code}
            >
              {menu.supported_languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
            <input
              className="rounded border p-2"
              onChange={(e) => setItemForm((f) => ({ ...f, item_name: e.target.value }))}
              placeholder="Item name"
              required
              value={itemForm.item_name}
            />
            <input
              className="rounded border p-2 md:col-span-2"
              onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description"
              value={itemForm.description}
            />
            <input
              className="md:col-span-2"
              onChange={(e) =>
                setItemForm((f) => ({ ...f, image: e.target.files?.[0] || null }))
              }
              type="file"
            />
          </div>
          <button className="mt-3 rounded bg-emerald-600 px-3 py-2 text-white" type="submit">
            Add Item
          </button>
        </form>

        <section className="rounded bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Current Menu (with translations)</h2>
          <div className="mt-3 space-y-4">
            {menu.categories.map((category) => (
              <div className="rounded border p-3" key={category.id}>
                <h3 className="font-semibold">{category.name}</h3>
                <div className="mt-2 space-y-3">
                  {category.items.map((item) => (
                    <div className="rounded bg-slate-50 p-2" key={item.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <strong>${Number(item.price).toFixed(2)}</strong>
                        <button
                          className="rounded bg-red-700 px-2 py-1 text-xs text-white"
                          onClick={() => deleteItem(item.id)}
                          type="button"
                        >
                          Delete Item
                        </button>
                      </div>
                      {menu.supported_languages.map((lang) => {
                        const tr = item.translations.find((t) => t.language_code === lang) || {
                          item_name: "",
                          description: ""
                        };
                        return (
                          <TranslationEditor
                            description={tr.description}
                            itemId={item.id}
                            itemName={tr.item_name}
                            key={`${item.id}-${lang}`}
                            languageCode={lang}
                            onSave={updateTranslation}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </DashboardLayout>
  );
}

function TranslationEditor({ itemId, languageCode, itemName, description, onSave }) {
  const [name, setName] = useState(itemName);
  const [desc, setDesc] = useState(description);
  return (
    <div className="mb-2 rounded border bg-white p-2">
      <p className="text-xs font-semibold text-slate-500">{languageCode.toUpperCase()}</p>
      <input
        className="mt-1 w-full rounded border p-1"
        onChange={(e) => setName(e.target.value)}
        placeholder="Translated item name"
        value={name}
      />
      <input
        className="mt-1 w-full rounded border p-1"
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Translated description"
        value={desc}
      />
      <button
        className="mt-1 rounded bg-indigo-600 px-2 py-1 text-xs text-white"
        onClick={() => onSave(itemId, languageCode, name, desc)}
        type="button"
      >
        Save Translation
      </button>
    </div>
  );
}
