/**
 * Dil kodlarını karşılaştırma ve etiketleme (BCP 47 — genelde küçük harf).
 * Menü ayarlarında "EN", " en " veya "en" aynı kabul edilir.
 */
export function normalizeLangCode(code) {
  if (code == null || code === "") {
    return "";
  }
  return String(code)
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

/** Yaygın ISO 639-1 / BCP47 kodları — bilinmeyen kodlar olduğu gibi gösterilir */
export const LANG_LABELS = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  ar: "العربية",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  nl: "Nederlands",
  pl: "Polski",
  uk: "Українська",
  el: "Ελληνικά",
  ro: "Română",
  bg: "Български",
  "zh-cn": "中文 (简体)",
  "zh-hans": "中文 (简体)",
  "zh-tw": "中文 (繁體)",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  hi: "हिन्दी",
  fa: "فارسی",
  he: "עברית",
  sv: "Svenska",
  da: "Dansk",
  fi: "Suomi",
  no: "Norsk",
  nb: "Norsk (bokmål)",
  nn: "Norsk (nynorsk)",
  cs: "Čeština",
  hu: "Magyar",
  sk: "Slovenčina",
  sl: "Slovenščina",
  hr: "Hrvatski",
  sr: "Српски",
  bs: "Bosanski",
  sq: "Shqip",
  az: "Azərbaycan",
  ka: "ქართული",
  ku: "Kurdî",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ไทย",
  vi: "Tiếng Việt"
};

export function languageLabel(code) {
  const raw = code == null ? "" : String(code).trim();
  if (!raw) {
    return "—";
  }
  const key = normalizeLangCode(raw);
  if (LANG_LABELS[key]) {
    return LANG_LABELS[key];
  }
  /* Uzun kodlar (ör. pt-BR) */
  const base = key.split("-")[0];
  if (base && LANG_LABELS[base]) {
    return LANG_LABELS[base];
  }
  return raw;
}
