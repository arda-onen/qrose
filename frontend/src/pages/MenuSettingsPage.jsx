import { useEffect, useMemo, useState } from "react";
import FilePicker from "../components/FilePicker";
import { FlashBanner, RestaurantPageShell, SubpageIntro } from "../components/restaurant/RestaurantChrome";
import { RestaurantMenuSettingsSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { apiFileUrl, apiRequest } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { ui } from "../lib/restaurantDashboardUi";
import { THEME_OPTIONS, normalizeThemeKey } from "../themes/themeStyles";

function SectionTitle({ icon, children }) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <h2 className="text-sm font-semibold text-slate-900">{children}</h2>
    </div>
  );
}

export default function MenuSettingsPage() {
  const toast = useToast();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [brandIconFile, setBrandIconFile] = useState(null);

  const publicMenuUrl = useMemo(
    () => (menu?.slug ? `${window.location.origin}/menu/${menu.slug}` : ""),
    [menu?.slug]
  );

  async function loadMenu() {
    try {
      const data = await apiRequest("/restaurant/menu");
      setMenu(data);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function copyPublicLink() {
    if (!publicMenuUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(publicMenuUrl);
      toast.push("Menü linki kopyalandı.");
    } catch {
      toast.push("Kopyalanamadı.", "error");
    }
  }

  async function saveMenuMeta(event) {
    event.preventDefault();
    setSaving(true);
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
          supported_languages: menu.supported_languages || []
        })
      });
      setNotice("Ayarlar kaydedildi.");
      toast.push("Menü ayarları kaydedildi.");
      await loadMenu();
    } catch (saveError) {
      setError(saveError.message);
      toast.push(saveError.message || "Kaydedilemedi.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function uploadBrandIcon(event) {
    event.preventDefault();
    if (!brandIconFile) {
      setError("Önce bir marka ikonu seçin.");
      return;
    }
    setUploadingBrand(true);
    try {
      const body = new FormData();
      body.append("image", brandIconFile);
      await apiRequest("/restaurant/menu/brand-icon", { method: "POST", body });
      setBrandIconFile(null);
      setNotice("Marka ikonu yüklendi.");
      await loadMenu();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingBrand(false);
    }
  }

  async function uploadHeroImage(event) {
    event.preventDefault();
    if (!heroImageFile) {
      setError("Önce bir kapak görseli seçin.");
      return;
    }
    setUploadingHero(true);
    try {
      const body = new FormData();
      body.append("image", heroImageFile);
      await apiRequest("/restaurant/menu/hero-image", { method: "POST", body });
      setHeroImageFile(null);
      setNotice("Kapak görseli yüklendi.");
      await loadMenu();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingHero(false);
    }
  }

  if (!menu) {
    return <RestaurantMenuSettingsSkeleton />;
  }

  const brandSrc = menu.brand_icon
    ? menu.brand_icon.startsWith("/uploads/")
      ? apiFileUrl(menu.brand_icon)
      : menu.brand_icon
    : null;
  const heroSrc = menu.hero_image
    ? menu.hero_image.startsWith("/uploads/")
      ? apiFileUrl(menu.hero_image)
      : menu.hero_image
    : null;

  return (
    <RestaurantPageShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SubpageIntro description="Başlık, tema, iletişim ve görseller. Kaydettikten sonra müşteri menüsünde güncellenir." />
        {publicMenuUrl ? (
          <div className="flex w-full shrink-0 flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 lg:max-w-md">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Halka açık link</p>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-2 py-1.5 text-xs text-slate-700">
                {publicMenuUrl}
              </code>
              <button
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                onClick={copyPublicLink}
                type="button"
              >
                Kopyala
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <FlashBanner type="error">{error}</FlashBanner> : null}
      {notice ? <FlashBanner type="success">{notice}</FlashBanner> : null}

      <form
        className="rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5"
        onSubmit={saveMenuMeta}
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-indigo-50/30 px-6 py-5">
          <SectionTitle
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            }
          >
            Temel bilgiler
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={ui.label} htmlFor="menu-name">
                Menü adı (iç kullanım)
              </label>
              <input
                className={ui.input}
                id="menu-name"
                onChange={(e) => setMenu((m) => ({ ...m, name: e.target.value }))}
                placeholder="Örn. Yaz menüsü 2025"
                value={menu.name}
              />
            </div>
            <div>
              <label className={ui.label} htmlFor="restaurant-name">
                Restoran adı
              </label>
              <input
                className={ui.input}
                id="restaurant-name"
                onChange={(e) => setMenu((m) => ({ ...m, restaurant_name: e.target.value }))}
                placeholder="Müşterinin göreceği isim"
                value={menu.restaurant_name}
              />
            </div>
            <div>
              <label className={ui.label} htmlFor="menu-theme">
                Tema
              </label>
              <select
                className={`${ui.input} cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                id="menu-theme"
                onChange={(e) => setMenu((m) => ({ ...m, theme: normalizeThemeKey(e.target.value) }))}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`
                }}
                value={normalizeThemeKey(menu.theme)}
              >
                {THEME_OPTIONS.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={ui.label} htmlFor="menu-langs">
                Desteklenen diller
              </label>
              <input
                className={ui.input}
                id="menu-langs"
                onChange={(e) =>
                  setMenu((m) => ({
                    ...m,
                    supported_languages: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                  }))
                }
                placeholder="en, tr, de"
                value={(menu.supported_languages || []).join(", ")}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                ISO dil kodlarını virgülle ayırın. Ürün çevirileri bu dillere göre istenir.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <SectionTitle
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            }
          >
            İletişim &amp; adres
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={ui.label} htmlFor="contact-phone">
                Telefon
              </label>
              <input
                className={ui.input}
                id="contact-phone"
                onChange={(e) => setMenu((m) => ({ ...m, contact_phone: e.target.value }))}
                placeholder="+90 …"
                type="tel"
                value={menu.contact_phone || ""}
              />
            </div>
            <div>
              <label className={ui.label} htmlFor="contact-email">
                E-posta
              </label>
              <input
                className={ui.input}
                id="contact-email"
                onChange={(e) => setMenu((m) => ({ ...m, contact_email: e.target.value }))}
                placeholder="info@…"
                type="email"
                value={menu.contact_email || ""}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={ui.label} htmlFor="address">
                Adres
              </label>
              <input
                className={ui.input}
                id="address"
                onChange={(e) => setMenu((m) => ({ ...m, address_line: e.target.value }))}
                placeholder="Sokak, ilçe, şehir"
                value={menu.address_line || ""}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={ui.label} htmlFor="shop-desc">
                İşletme açıklaması
              </label>
              <textarea
                className={`${ui.input} min-h-[100px] resize-y`}
                id="shop-desc"
                onChange={(e) => setMenu((m) => ({ ...m, shop_description: e.target.value }))}
                placeholder="Kısa tanıtım metni (temada görünebilir)"
                rows={4}
                value={menu.shop_description || ""}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button className={ui.primaryBtn} disabled={saving} type="submit">
            {saving ? (
              <>
                <span aria-hidden className={`${ui.btnSpinner} mr-0`} />
                Kaydediliyor…
              </>
            ) : (
              "Değişiklikleri kaydet"
            )}
          </button>
        </div>
      </form>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Menü görselleri</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5"
            onSubmit={uploadBrandIcon}
          >
            <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50/80 to-white px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                  </svg>
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Marka ikonu</h2>
                  <p className="text-xs text-slate-500">Kare veya yuvarlak logo önerilir (PNG, JPG).</p>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4">
                {brandSrc ? (
                  <img
                    alt="Marka ikonu önizleme"
                    className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-sm"
                    src={brandSrc}
                  />
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <span className="rounded-full bg-slate-200/80 p-3 text-slate-400">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.2}
                        />
                      </svg>
                    </span>
                    <p className="mt-2 text-sm font-medium text-slate-600">Henüz ikon yok</p>
                    <p className="mt-0.5 text-xs text-slate-500">Yükleyerek menüde görünmesini sağlayın</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <FilePicker
                  buttonLabel="Görsel seç"
                  emptyHint="Dosya seçilmedi"
                  onFileChange={setBrandIconFile}
                />
              </div>
              <button
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={uploadingBrand}
                type="submit"
              >
                {uploadingBrand ? "Yükleniyor…" : "İkonu yükle"}
              </button>
            </div>
          </form>

          <form
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5"
            onSubmit={uploadHeroImage}
          >
            <div className="border-b border-slate-100 bg-gradient-to-br from-rose-50/80 to-white px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                    <path d="M4 15l4-4a2 2 0 012.828 0L16 15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                    <path d="M14 13l1.5-1.5a2 2 0 012.828 0L22 16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  </svg>
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Kapak görseli</h2>
                  <p className="text-xs text-slate-500">Geniş yatay fotoğraf; menü üstünde banner olarak kullanılır.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                {heroSrc ? (
                  <img
                    alt="Kapak görseli önizleme"
                    className="h-40 w-full object-cover"
                    src={heroSrc}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="rounded-full bg-slate-200/80 p-3 text-slate-400">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.2}
                        />
                      </svg>
                    </span>
                    <p className="mt-2 text-sm font-medium text-slate-600">Kapak görseli yok</p>
                    <p className="mt-0.5 text-xs text-slate-500">Yükleyerek menüye derinlik katabilirsiniz</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <FilePicker
                  buttonLabel="Görsel seç"
                  emptyHint="Dosya seçilmedi"
                  onFileChange={setHeroImageFile}
                />
              </div>
              <button
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={uploadingHero}
                type="submit"
              >
                {uploadingHero ? "Yükleniyor…" : "Kapağı yükle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RestaurantPageShell>
  );
}
