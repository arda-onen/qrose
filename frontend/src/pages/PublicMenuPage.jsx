import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { apiRequest, publicApiRequest } from "../lib/api";
import PublicCallWaiterFab from "../components/PublicCallWaiterFab";
import MobileCategoryDrawer from "../components/MobileCategoryDrawer";
import { useActiveCategory } from "../lib/useActiveCategory";
import { themeMap } from "../themes";
import { normalizePaletteKey, normalizeThemeKey, paletteChrome } from "../themes/themeStyles";

/** React Strict Mode (dev) aynı sayfada effect'i iki kez çalıştırır; izleme POST'u çift gider. Aynı slug için kısa sürede tekrar göndermeyi engeller. */
let lastMenuTrackSent = { slug: null, at: 0 };
const MENU_TRACK_DEDupe_MS = 1500;

export default function PublicMenuPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableToken = (searchParams.get("t") || "").trim();
  const [menu, setMenu] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      setError("");
      setIsLoading(true);

      try {
        const data = await apiRequest(`/menu/${slug}`);
        setMenu(data);
        setSelectedLanguage(data.supported_languages?.[0] || "en");
        const normalizedTheme = normalizeThemeKey(data.theme);
        window.localStorage.setItem(`qrose-theme-${slug}`, normalizedTheme);
      } catch (fetchError) {
        setError(fetchError.message);
        setMenu(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, [slug]);

  useEffect(() => {
    if (!menu) {
      return undefined;
    }
    const now = Date.now();
    if (
      lastMenuTrackSent.slug === slug &&
      now - lastMenuTrackSent.at < MENU_TRACK_DEDupe_MS
    ) {
      return undefined;
    }
    lastMenuTrackSent = { slug, at: now };

    const itemIds = menu.categories.flatMap((c) => c.items.map((i) => i.id));
    publicApiRequest(`/track/menu/${slug}`, {
      method: "POST",
      body: JSON.stringify({ itemIds })
    }).catch(() => {
      /* istatistik hatası menüyü etkilemesin */
    });
    return undefined;
  }, [menu, slug]);

  const Theme = useMemo(() => {
    if (!menu) {
      return null;
    }
    return themeMap[normalizeThemeKey(menu.theme)] || themeMap.cafe;
  }, [menu]);
  const categoryIds = useMemo(() => menu?.categories.map((category) => category.id) || [], [menu]);
  const activeCategoryId = useActiveCategory(categoryIds);

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>;
  }
  if (isLoading || !menu || !Theme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-600">
        <span
          aria-hidden
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"
        />
        <p className="text-sm font-medium">Yükleniyor…</p>
        <span className="sr-only">Menü yükleniyor</span>
      </div>
    );
  }

  const normalizedTheme = normalizeThemeKey(menu.theme);
  const paletteKey = normalizePaletteKey(menu.color_palette);
  const chrome = paletteChrome[paletteKey] || paletteChrome.sunset;
  const activeCategoryIndex = Math.max(
    0,
    categoryIds.findIndex((categoryId) => categoryId === activeCategoryId)
  );
  const progressPercent = categoryIds.length <= 1 ? 100 : (activeCategoryIndex / (categoryIds.length - 1)) * 100;

  return (
    <div className={`min-h-screen ${chrome.page}`}>
      <div className="fixed inset-x-0 top-0 z-30">
        <div className={`h-1 w-full ${chrome.progressTrack}`}>
          <div
            className={`h-full transition-all duration-300 ease-out ${chrome.progressBar}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className={tableToken ? "pb-32 md:pb-10" : "pb-24 md:pb-0"}>
        <Theme
          activeCategoryId={activeCategoryId}
          colorPalette={paletteKey}
          languageCode={selectedLanguage}
          menu={menu}
          onLanguageChange={setSelectedLanguage}
          themeKey={normalizedTheme}
        />
      </div>
      <MobileCategoryDrawer
        activeCategoryId={activeCategoryId}
        categories={menu.categories}
        chipActiveClass={chrome.chipActive}
        chipBaseClass={chrome.chipBase}
        languageCode={selectedLanguage}
      />
      <PublicCallWaiterFab slug={slug} tableToken={tableToken} />
    </div>
  );
}
