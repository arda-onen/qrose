import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { apiFileUrl, apiRequest } from "../lib/api";

export default function ItemEditPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [translations, setTranslations] = useState([]);

  const allItems = useMemo(
    () =>
      menu
        ? menu.categories.flatMap((category) =>
            category.items.map((item) => ({
              ...item,
              categoryName: category.name
            }))
          )
        : [],
    [menu]
  );
  const item = useMemo(() => allItems.find((entry) => entry.id === Number(itemId)) || null, [allItems, itemId]);

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await apiRequest("/restaurant/menu");
        setMenu(data);
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    loadMenu();
  }, []);

  useEffect(() => {
    if (!menu || !item) {
      return;
    }
    setPrice(item.price ?? "");
    setCategoryId(String(item.category_id || ""));
    setSortOrder(item.sort_order ?? 0);
    const mapped = menu.supported_languages.map((lang) => {
      const tr = item.translations.find((entry) => entry.language_code === lang);
      return {
        language_code: lang,
        item_name: tr?.item_name || "",
        description: tr?.description || ""
      };
    });
    setTranslations(mapped);
  }, [menu, item]);

  function updateTranslation(languageCode, patch) {
    setTranslations((prev) =>
      prev.map((entry) =>
        entry.language_code === languageCode ? { ...entry, ...patch } : entry
      )
    );
  }

  async function saveItem(event) {
    event.preventDefault();
    try {
      const body = new FormData();
      body.append("price", String(price));
      body.append("category_id", String(categoryId));
      body.append("sort_order", String(sortOrder));
      body.append("translations", JSON.stringify(translations));
      if (imageFile) {
        body.append("image", imageFile);
      }
      await apiRequest(`/restaurant/items/${itemId}`, { method: "PUT", body });
      setNotice("Item and localizations updated.");
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  if (!menu) {
    return (
      <DashboardLayout title="Edit Item">
        <p className="text-sm text-slate-600">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout title="Edit Item">
        <p className="text-sm text-red-600">Item not found.</p>
        <Link className="mt-3 inline-block text-sm font-semibold text-indigo-600" to="/restaurant">
          Back to Dashboard
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Edit Item #${item.id}`}>
      <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveItem}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Edit item details and localizations</p>
          <button
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            onClick={() => navigate("/restaurant")}
            type="button"
          >
            Back
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border border-slate-300 p-2.5"
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            step="0.01"
            type="number"
            value={price}
          />
          <select
            className="rounded-md border border-slate-300 p-2.5"
            onChange={(e) => setCategoryId(e.target.value)}
            value={categoryId}
          >
            {menu.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-slate-300 p-2.5"
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
            value={sortOrder}
          />
        </div>

        <div>
          <input className="w-full text-sm" onChange={(e) => setImageFile(e.target.files?.[0] || null)} type="file" />
          {item.image ? (
            <img
              alt="Item"
              className="mt-3 h-36 w-full rounded-xl border object-cover"
              src={item.image.startsWith("/uploads/") ? apiFileUrl(item.image) : item.image}
            />
          ) : null}
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900">Localizations</h3>
          <div className="mt-3 space-y-3">
            {translations.map((entry) => (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={entry.language_code}>
                <p className="text-xs font-semibold text-slate-500">{entry.language_code.toUpperCase()}</p>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
                  onChange={(e) =>
                    updateTranslation(entry.language_code, { item_name: e.target.value })
                  }
                  placeholder="Item name"
                  value={entry.item_name}
                />
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
                  onChange={(e) =>
                    updateTranslation(entry.language_code, { description: e.target.value })
                  }
                  placeholder="Description"
                  rows={2}
                  value={entry.description}
                />
              </div>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="submit">
          Save Item
        </button>
      </form>
    </DashboardLayout>
  );
}
