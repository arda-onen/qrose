export const THEME_OPTIONS = [
  { label: "Fast Food Theme", value: "fast_food" }
];

export const paletteChrome = {
  sunset: {
    page: "bg-gradient-to-b from-orange-50 via-white to-amber-50",
    selector: "border-orange-300 bg-white text-orange-700 focus:border-orange-500 focus:ring-orange-200",
    progressTrack: "bg-orange-200",
    progressBar: "bg-orange-500",
    progressText: "text-orange-700",
    chipBase: "border-orange-200 bg-white text-orange-700",
    chipActive: "border-orange-500 bg-orange-500 text-white"
  },
  emerald: {
    page: "bg-gradient-to-b from-emerald-50 via-white to-teal-50",
    selector: "border-emerald-300 bg-white text-emerald-700 focus:border-emerald-500 focus:ring-emerald-200",
    progressTrack: "bg-emerald-200",
    progressBar: "bg-emerald-500",
    progressText: "text-emerald-700",
    chipBase: "border-emerald-200 bg-white text-emerald-700",
    chipActive: "border-emerald-500 bg-emerald-500 text-white"
  },
  royal: {
    page: "bg-gradient-to-b from-indigo-50 via-white to-violet-50",
    selector: "border-indigo-300 bg-white text-indigo-700 focus:border-indigo-500 focus:ring-indigo-200",
    progressTrack: "bg-indigo-200",
    progressBar: "bg-indigo-500",
    progressText: "text-indigo-700",
    chipBase: "border-indigo-200 bg-white text-indigo-700",
    chipActive: "border-indigo-500 bg-indigo-500 text-white"
  }
};

export function normalizeThemeKey(themeKey) {
  if (
    themeKey === "classic" ||
    themeKey === "minimal" ||
    themeKey === "cafe" ||
    themeKey === "luxury" ||
    themeKey === "restaurant" ||
    themeKey === "street_food" ||
    themeKey === "dark_modern" ||
    themeKey === "fast_food"
  ) {
    return "fast_food";
  }
  return "fast_food";
}

export function normalizePaletteKey(paletteKey) {
  void paletteKey;
  return "sunset";
}
