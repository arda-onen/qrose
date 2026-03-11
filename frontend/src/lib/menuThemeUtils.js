export function getItemTranslation(item, languageCode) {
  return (
    item.translations.find((translation) => translation.language_code === languageCode) ||
    item.translations[0]
  );
}

export function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function categoryAnchor(categoryId) {
  return `category-${categoryId}`;
}
