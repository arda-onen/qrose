/**
 * Üst bar ve başlık için rota → başlık eşlemesi
 */
export function getRestaurantPageMeta(pathname) {
  const p = pathname.replace(/\/$/, "") || "/";

  if (p === "/restaurant") {
    return { title: "Panel", subtitle: "Özet, kategoriler ve hızlı erişim" };
  }
  if (p.startsWith("/restaurant/products")) {
    return { title: "Ürünler", subtitle: "Arama, sıralama ve toplu işlemler" };
  }
  if (p.startsWith("/restaurant/tables")) {
    return { title: "Masalar & QR", subtitle: "Masa başına QR ve garson çağrısı" };
  }
  if (p.startsWith("/restaurant/analytics")) {
    return { title: "İstatistik", subtitle: "Görüntülenme ve menü paylaşımı" };
  }
  if (p.startsWith("/restaurant/settings")) {
    return { title: "Menü ayarları", subtitle: "Tema, iletişim ve görseller" };
  }
  if (p === "/restaurant/categories/new") {
    return { title: "Kategori ekle", subtitle: "Yeni kategori oluşturun" };
  }
  if (p.startsWith("/restaurant/categories/") && p.endsWith("/edit")) {
    return { title: "Kategori düzenle", subtitle: "Kategori bilgilerini güncelleyin" };
  }
  if (p === "/restaurant/items/new") {
    return { title: "Ürün ekle", subtitle: "Menüye yeni ürün ekleyin" };
  }
  if (p.startsWith("/restaurant/items/") && p.endsWith("/edit")) {
    return { title: "Ürün düzenle", subtitle: "Ürün detaylarını güncelleyin" };
  }

  return { title: "Restoran paneli", subtitle: "QRose menü yönetimi" };
}
