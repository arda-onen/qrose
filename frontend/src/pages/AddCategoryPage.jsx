import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilePicker from "../components/FilePicker";
import { FlashBanner, RestaurantPageShell, SubpageIntro } from "../components/restaurant/RestaurantChrome";
import { RestaurantFormSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { apiRequest } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { ui } from "../lib/restaurantDashboardUi";
import { languageLabel, normalizeLangCode } from "../lib/languageLabels";

export default function AddCategoryPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [image, setImage] = useState(null);
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest("/restaurant/menu");
        setMenu(data);
        setTranslations(
          (data.supported_languages || ["tr"]).map((lang) => ({
            language_code: lang,
            name: "",
            short_description: ""
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
    const filled = translations.filter((t) => t.name?.trim());
    if (!filled.length) {
      setError("En az bir dil için kategori adı girin.");
      toast.push("En az bir dilde kategori adı yazın.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append(
        "translations",
        JSON.stringify(
          translations.map((t) => ({
            language_code: normalizeLangCode(t.language_code) || t.language_code,
            name: t.name.trim(),
            short_description: t.short_description || ""
          }))
        )
      );
      body.append("sort_order", String(sortOrder));
      if (image) {
        body.append("image", image);
      }
      await apiRequest("/restaurant/categories", { method: "POST", body });
      toast.push("Kategori oluşturuldu.");
      navigate("/restaurant");
    } catch (err) {
      setError(err.message);
      toast.push(err.message || "Kategori kaydedilemedi.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!menu) {
    return <RestaurantFormSkeleton variant="category" />;
  }

  return (
    <RestaurantPageShell>
      <SubpageIntro description="Her dil için kategori adı ve isteğe bağlı kısa açıklama. Menüde seçilen dile göre gösterilir." />

      <form className="space-y-6" onSubmit={onSubmit}>
        {error ? <FlashBanner type="error">{error}</FlashBanner> : null}

        <section className={`${ui.card} p-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sıra ve görsel</h2>
          <p className="mt-1 text-sm text-slate-500">Listede hangi sırada görüneceği ve isteğe bağlı kapak görseli.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="cat-sort">
                Menüde sırası
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                id="cat-sort"
                min={0}
                onChange={(e) => setSortOrder(e.target.value)}
                type="number"
                value={sortOrder}
              />
              <p className="text-xs text-slate-500">Küçük sayı üstte listelenir.</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-700">Kapak görseli</span>
              <FilePicker buttonLabel="Görsel seç" emptyHint="İsteğe bağlı" onFileChange={(file) => setImage(file)} />
            </div>
          </div>
        </section>

        <section className={`${ui.card} p-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Metinler ve çeviriler</h2>
          <p className="mt-1 text-sm text-slate-500">Menünüzde tanımlı dillere göre kartlar oluşturulur.</p>
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
                    className="min-h-[72px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    onChange={(e) => updateTranslation(entry.language_code, { short_description: e.target.value })}
                    placeholder="Kısa açıklama (isteğe bağlı)"
                    rows={2}
                    value={entry.short_description}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button className={`${ui.primaryBtn} min-w-[180px]`} disabled={submitting} type="submit">
            {submitting ? (
              <>
                <span aria-hidden className={ui.btnSpinner} />
                Oluşturuluyor…
              </>
            ) : (
              "Kategoriyi oluştur"
            )}
          </button>
          <button
            className={ui.secondaryBtn}
            disabled={submitting}
            onClick={() => navigate("/restaurant")}
            type="button"
          >
            İptal
          </button>
        </div>
      </form>
    </RestaurantPageShell>
  );
}
