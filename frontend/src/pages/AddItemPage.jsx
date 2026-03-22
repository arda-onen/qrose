import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilePicker from "../components/FilePicker";
import { FlashBanner, RestaurantPageShell, SubpageIntro } from "../components/restaurant/RestaurantChrome";
import { RestaurantFormSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { apiRequest } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { ui } from "../lib/restaurantDashboardUi";
import { languageLabel, normalizeLangCode } from "../lib/languageLabels";
import { getCategoryDisplayNameForAdmin } from "../lib/menuThemeUtils";

export default function AddItemPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    if (!image) {
      setImagePreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(image);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest("/restaurant/menu");
        setMenu(data);
        if (data.categories[0]) {
          setCategoryId(String(data.categories[0].id));
        }
        setTranslations(
          (data.supported_languages || ["tr"]).map((lang) => ({
            language_code: lang,
            item_name: "",
            description: ""
          }))
        );
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, []);

  function updateTranslation(languageCode, patch) {
    setTranslations((prev) =>
      prev.map((entry) => (entry.language_code === languageCode ? { ...entry, ...patch } : entry))
    );
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!menu) {
      return;
    }
    const valid = translations.filter((t) => t.item_name?.trim());
    if (!valid.length) {
      setError("En az bir dil için ürün adı girin.");
      toast.push("En az bir dilde ürün adı yazın.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("category_id", categoryId);
      body.append("price", price || "0");
      body.append("sort_order", String(sortOrder));
      body.append("is_published", String(isPublished));
      body.append(
        "translations",
        JSON.stringify(
          valid.map((t) => ({
            language_code: normalizeLangCode(t.language_code) || t.language_code,
            item_name: t.item_name.trim(),
            description: t.description || ""
          }))
        )
      );
      if (image) {
        body.append("image", image);
      }
      await apiRequest("/restaurant/items", { method: "POST", body });
      toast.push("Ürün oluşturuldu.");
      navigate("/restaurant/products");
    } catch (err) {
      setError(err.message);
      toast.push(err.message || "Ürün kaydedilemedi.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!menu) {
    return <RestaurantFormSkeleton variant="product" />;
  }

  if (!menu.categories.length) {
    return (
      <RestaurantPageShell>
        <div className={`${ui.card} p-10 text-center`}>
          <p className="text-sm text-slate-600">Önce bir kategori oluşturmanız gerekiyor.</p>
          <Link className={`${ui.primaryBtn} mt-6 inline-flex`} to="/restaurant/categories/new">
            Kategori ekle
          </Link>
          <div className="mt-4">
            <button
              className="text-sm font-medium text-slate-500 underline hover:text-slate-800"
              onClick={() => navigate("/restaurant")}
              type="button"
            >
              Panele dön
            </button>
          </div>
        </div>
      </RestaurantPageShell>
    );
  }

  return (
    <RestaurantPageShell>
      <SubpageIntro description="Kategori, fiyat ve metinleri girin. Dilleri şimdi doldurabilir veya sonra düzenleyebilirsiniz." />

      <form className="space-y-6" onSubmit={onSubmit}>
        {error ? <FlashBanner type="error">{error}</FlashBanner> : null}

        <section className={`${ui.card} p-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Fiyat ve yerleşim</h2>
          <p className="mt-1 text-sm text-slate-500">Kategori, fiyat ve bu kategorideki listede görünme sırası.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="add-price">
                Fiyat (₺)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                id="add-price"
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={price}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-slate-700" htmlFor="add-cat">
                Kategori
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                id="add-cat"
                onChange={(e) => setCategoryId(e.target.value)}
                required
                value={categoryId}
              >
                {menu.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryDisplayNameForAdmin(c, menu.supported_languages)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="add-sort">
                Menüde sırası
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                id="add-sort"
                min={0}
                onChange={(e) => setSortOrder(e.target.value)}
                type="number"
                value={sortOrder}
              />
              <p className="text-xs text-slate-500">
                Bu kategoride ürünlerin listede hangi sırada görüneceğini belirler. Küçük sayı üstte (ör. 0, 1, 2…).
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3">
            <input
              checked={isPublished}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              id="add-published"
              onChange={(e) => setIsPublished(e.target.checked)}
              type="checkbox"
            />
            <div>
              <label className="text-sm font-medium text-slate-800" htmlFor="add-published">
                Menüde yayında
              </label>
              <p className="text-xs text-slate-500">
                İşaretli değilse ürün taslak olur; halka açık menüde görünmez.
              </p>
            </div>
          </div>
        </section>

        <section className={`${ui.card} p-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ürün görseli</h2>
          <p className="mt-1 text-sm text-slate-500">Menüde gösterilecek fotoğraf. İsteğe bağlı; sonra da ekleyebilirsiniz.</p>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80 lg:shrink-0">
              {imagePreviewUrl ? (
                <img alt="" className="h-full w-full object-cover" src={imagePreviewUrl} />
              ) : (
                <div className="flex h-full min-h-[160px] items-center justify-center px-4 text-center text-sm text-slate-400">
                  Henüz görsel seçilmedi
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-700">Görsel yükle</label>
              <FilePicker
                buttonLabel="Dosya seç"
                emptyHint="İsteğe bağlı"
                onFileChange={(file) => setImage(file)}
              />
            </div>
          </div>
        </section>

        <section className={`${ui.card} p-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Metinler ve çeviriler</h2>
          <p className="mt-1 text-sm text-slate-500">
            Her dil için ürün adı ve açıklama ayrı kaydedilir. En az bir dilde ad zorunludur; boş bıraktığınız diller
            kayda alınmaz.
          </p>
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
                  <div>
                    <label className="sr-only" htmlFor={`add-name-${entry.language_code}`}>
                      Ürün adı ({entry.language_code})
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      id={`add-name-${entry.language_code}`}
                      onChange={(e) => updateTranslation(entry.language_code, { item_name: e.target.value })}
                      placeholder="Ürün adı"
                      value={entry.item_name}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`add-desc-${entry.language_code}`}>
                      Açıklama ({entry.language_code})
                    </label>
                    <textarea
                      className="min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      id={`add-desc-${entry.language_code}`}
                      onChange={(e) => updateTranslation(entry.language_code, { description: e.target.value })}
                      placeholder="Kısa açıklama (isteğe bağlı)"
                      rows={3}
                      value={entry.description}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            className={ui.secondaryBtn}
            disabled={submitting}
            onClick={() => navigate("/restaurant")}
            type="button"
          >
            İptal
          </button>
          <button className={`${ui.primaryBtn} min-w-[180px]`} disabled={submitting} type="submit">
            {submitting ? (
              <>
                <span aria-hidden className={ui.btnSpinner} />
                Oluşturuluyor…
              </>
            ) : (
              "Ürünü oluştur"
            )}
          </button>
        </div>
      </form>
    </RestaurantPageShell>
  );
}
