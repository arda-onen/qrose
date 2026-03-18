import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import MobileCategoryDrawer from "../components/MobileCategoryDrawer";
import { useActiveCategory } from "../lib/useActiveCategory";
import { themeMap } from "../themes";
import ThemeLoadingSkeleton from "../themes/ThemeLoadingSkeleton";
import { normalizeThemeKey, paletteChrome } from "../themes/themeStyles";

export default function PublicMenuPage() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingThemeKey, setLoadingThemeKey] = useState("fast_food");
  const loadingPaletteKey = "sunset";

  useEffect(() => {
    async function fetchMenu() {
      setError("");
      setIsLoading(true);
      const cachedTheme = normalizeThemeKey(window.localStorage.getItem(`qrose-theme-${slug}`));
      setLoadingThemeKey(cachedTheme);

      try {
        const data = await apiRequest(`/menu/${slug}`);
        setMenu(data);
        setSelectedLanguage(data.supported_languages?.[0] || "en");
        const normalizedTheme = normalizeThemeKey(data.theme);
        setLoadingThemeKey(normalizedTheme);
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
    const loadingChrome = paletteChrome[loadingPaletteKey] || paletteChrome.sunset;
    return (
      <div className={`min-h-screen ${loadingChrome.page}`}>
        <ThemeLoadingSkeleton themeKey={loadingThemeKey} />
      </div>
    );
  }

  const normalizedTheme = normalizeThemeKey(menu.theme);
  const chrome = paletteChrome.sunset;
  const activeCategoryIndex = Math.max(
    0,
    categoryIds.findIndex((categoryId) => categoryId === activeCategoryId)
  );
  const progressPercent = categoryIds.length <= 1 ? 100 : (activeCategoryIndex / (categoryIds.length - 1)) * 100;
  const activeCategoryName =
    menu.categories.find((category) => category.id === activeCategoryId)?.name || menu.categories[0]?.name || "";

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
      <div className="pb-24 md:pb-0">
        <Theme
          activeCategoryId={activeCategoryId}
          colorPalette="sunset"
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
      />
    </div>
  );
}
