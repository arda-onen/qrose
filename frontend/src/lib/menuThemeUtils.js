import { normalizeLangCode } from "./languageLabels";

/** Dil kodu eşleşmesi: DB'de "EN" ile menüde "en" aynı sayılır */
export function findTranslationByLang(list, languageCode) {
  if (!list?.length) {
    return undefined;
  }
  const want = normalizeLangCode(languageCode);
  if (!want) {
    return list[0];
  }
  return list.find((t) => normalizeLangCode(t.language_code) === want);
}

export function getItemTranslation(item, languageCode) {
  const list = item.translations;
  if (!list?.length) {
    return undefined;
  }
  return findTranslationByLang(list, languageCode) || list[0];
}

/** Metinler menü diline göre; çeviri yoksa kategori tablosundaki ad kullanılır. */
export function getCategoryTranslation(category, languageCode) {
  const list = category.translations;
  if (!list?.length) {
    return {
      name: category.name || "",
      short_description: category.short_description || ""
    };
  }
  const found = findTranslationByLang(list, languageCode) || list[0];
  return {
    name: found?.name ?? category.name ?? "",
    short_description: found?.short_description ?? category.short_description ?? ""
  };
}

/** Restoran panelinde kategori seçici / tablo için görünen ad (önce menü dil sırası). */
export function getCategoryDisplayNameForAdmin(category, supportedLanguages = []) {
  if (!category) {
    return "";
  }
  const langs = Array.isArray(supportedLanguages) ? supportedLanguages : [];
  for (const code of langs) {
    const t = findTranslationByLang(category.translations, code);
    if (t?.name?.trim()) {
      return t.name.trim();
    }
  }
  const first = category.translations?.[0];
  if (first?.name?.trim()) {
    return first.name.trim();
  }
  return category.name || "—";
}

export function getCategoryShortDescriptionForAdmin(category, supportedLanguages = []) {
  if (!category) {
    return "";
  }
  const langs = Array.isArray(supportedLanguages) ? supportedLanguages : [];
  for (const code of langs) {
    const t = findTranslationByLang(category.translations, code);
    if (t?.short_description?.trim()) {
      return t.short_description.trim();
    }
  }
  const first = category.translations?.[0];
  if (first?.short_description?.trim()) {
    return first.short_description.trim();
  }
  return category.short_description || "—";
}

export function formatPrice(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function categoryAnchor(categoryId) {
  return `category-${categoryId}`;
}
