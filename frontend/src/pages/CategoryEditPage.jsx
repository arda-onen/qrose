import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FilePicker from "../components/FilePicker";
import { RestaurantEditorSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { apiFileUrl, apiRequest } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { languageLabel, normalizeLangCode } from "../lib/languageLabels";
import { findTranslationByLang, getCategoryDisplayNameForAdmin } from "../lib/menuThemeUtils";
import { ui } from "../lib/restaurantDashboardUi";

export default function CategoryEditPage() {
  const toast = useToast();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [translations, setTranslations] = useState([]);

  const category = useMemo(
    () => menu?.categories.find((entry) => entry.id === Number(categoryId)) || null,
    [menu, categoryId]
  );

  const displayName = useMemo(
    () => (menu && category ? getCategoryDisplayNameForAdmin(category, menu.supported_languages) : ""),
    [menu, category]
  );

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
    if (!menu || !category) {
      return;
    }
    setSortOrder(category.sort_order ?? 0);
    const mapped = menu.supported_languages.map((lang) => {
      const tr = findTranslationByLang(category.translations, lang);
      return {
        language_code: lang,
        name: tr?.name || "",
        short_description: tr?.short_description || ""
      };
    });
    setTranslations(mapped);
  }, [menu, category]);

  function updateTranslation(languageCode, patch) {
    setTranslations((prev) =>
      prev.map((entry) => (entry.language_code === languageCode ? { ...entry, ...patch } : entry))
    );
  }

  async function saveCategory(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    const filled = translations.filter((t) => t.name?.trim());
    if (!filled.length) {
      setError("En az bir dil için kategori adı girin.");
      toast.push("En az bir dilde kategori adı yazın.", "error");
      return;
    }
    setSaving(true);
    try {
      const normalized = translations.map((t) => ({
        ...t,
        language_code: normalizeLangCode(t.language_code) || t.language_code,
        name: t.name ?? "",
        short_description: t.short_description ?? ""
      }));
      await apiRequest(`/restaurant/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify({
          translations: normalized,
          sort_order: sortOrder
        })
      });
      if (imageFile) {
        const body = new FormData();
        body.append("image", imageFile);
        await apiRequest(`/restaurant/categories/${categoryId}/image`, { method: "POST", body });
      }
      setNotice("Kategori ve çeviriler güncellendi.");
      toast.push("Kayıt başarılı — kategori güncellendi.");
      const data = await apiRequest("/restaurant/menu");
      setMenu(data);
    } catch (saveError) {
      setError(saveError.message);
      toast.push(saveError.message || "Kaydedilemedi.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!menu) {
    return <RestaurantEditorSkeleton mode="category" />;
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-800">Kategori bulunamadı.</p>
        <Link
          className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          to="/restaurant"
        >
          Panele dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
            onClick={() => navigate("/restaurant")}
            type="button"
          >
            <span aria-hidden="true">←</span> Panele dön
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kategori düzenle</h1>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{displayName}</span>
            <span className="text-slate-400"> · #{category.id}</span>
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={saveCategory}>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}
        {notice ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sıra ve görsel</h2>
          <p className="mt-1 text-sm text-slate-500">Listede sıra ve kapak görseli.</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,14rem)_1fr] lg:items-start">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="edit-cat-sort">
                Menüde sırası
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                id="edit-cat-sort"
                min={0}
                onChange={(e) => setSortOrder(e.target.value)}
                type="number"
                value={sortOrder}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                {category.image ? (
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={category.image.startsWith("/uploads/") ? apiFileUrl(category.image) : category.image}
                  />
                ) : (
                  <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-slate-400">
                    Görsel yok
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <label className="text-xs font-medium text-slate-700">Yeni görsel yükle</label>
                <FilePicker buttonLabel="Dosya seç" emptyHint="Değiştirmek için seçin" onFileChange={setImageFile} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Metinler ve çeviriler</h2>
          <p className="mt-1 text-sm text-slate-500">Her dil için kategori adı ve kısa açıklama ayrı kaydedilir.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {translations.map((entry) => (
              <div
                className="rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4 shadow-sm ring-1 ring-slate-100"
                key={entry.language_code}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                    {entry.language_code.toUpperCase().slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{languageLabel(entry.language_code)}</p>
                    <p className="text-xs text-slate-500">{entry.language_code}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    onChange={(e) => updateTranslation(entry.language_code, { name: e.target.value })}
                    placeholder="Kategori adı"
                    value={entry.name}
                  />
                  <textarea
                    className="min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    onChange={(e) => updateTranslation(entry.language_code, { short_description: e.target.value })}
                    placeholder="Kısa açıklama (isteğe bağlı)"
                    rows={3}
                    value={entry.short_description}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button className={`${ui.primaryBtn} min-w-[140px]`} disabled={saving} type="submit">
            {saving ? (
              <>
                <span aria-hidden className={ui.btnSpinner} />
                Kaydediliyor…
              </>
            ) : (
              "Kaydet"
            )}
          </button>
          <button
            className={ui.secondaryBtn}
            disabled={saving}
            onClick={() => navigate("/restaurant")}
            type="button"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
