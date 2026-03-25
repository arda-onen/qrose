const ALLOWED_THEMES = new Set(["cafe", "restaurant", "fast_food"]);
const ALLOWED_PALETTES = new Set(["sunset", "emerald", "royal"]);

export const THEME_OPTIONS = [
  { label: "Kafe teması", value: "cafe" },
  { label: "Restoran teması", value: "restaurant" },
  { label: "Fast food teması", value: "fast_food" }
];

export const paletteChrome = {
  sunset: {
    page: "bg-gradient-to-b from-rose-50 via-white to-slate-50",
    selector: "border-rose-300 bg-white text-rose-700 focus:border-rose-500 focus:ring-rose-200",
    progressTrack: "bg-rose-100",
    progressBar: "bg-rose-500",
    progressText: "text-rose-700",
    chipBase: "border-rose-200 bg-white text-rose-700",
    chipActive: "border-rose-500 bg-rose-500 text-white"
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
  const key = String(themeKey || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (ALLOWED_THEMES.has(key)) {
    return key;
  }
  return "fast_food";
}

export function normalizePaletteKey(paletteKey) {
  const key = String(paletteKey || "")
    .trim()
    .toLowerCase();
  if (ALLOWED_PALETTES.has(key)) {
    return key;
  }
  return "sunset";
}
