import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlashBanner, RestaurantPageShell, SubpageIntro } from "../components/restaurant/RestaurantChrome";
import { RestaurantAnalyticsSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { apiRequest } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { ui } from "../lib/restaurantDashboardUi";
import { getCategoryDisplayNameForAdmin } from "../lib/menuThemeUtils";
import { getMissingLangs } from "../lib/restaurantDashboardUtils";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function RestaurantAnalyticsPage() {
  const toast = useToast();
  const [menu, setMenu] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  async function loadMenu() {
    const data = await apiRequest("/restaurant/menu");
    setMenu(data);
    return data;
  }

  async function loadAnalytics() {
    try {
      const a = await apiRequest("/restaurant/menu/analytics");
      setAnalytics(a);
    } catch {
      setAnalytics(null);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadMenu();
        await loadAnalytics();
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  const allItems = useMemo(() => {
    if (!menu) {
      return [];
    }
    return menu.categories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: getCategoryDisplayNameForAdmin(category, menu.supported_languages),
        categoryId: category.id
      }))
    );
  }, [menu]);

  const publicMenuUrl = menu ? `${window.location.origin}/menu/${menu.slug}` : "";

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(publicMenuUrl);
      toast.push("Menü linki panoya kopyalandı.");
    } catch {
      toast.push("Kopyalanamadı.", "error");
    }
  }, [publicMenuUrl, toast]);

  const downloadQr = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/restaurant/menu/qr`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error("QR indirilemedi.");
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^";]+)"?/.exec(cd);
      const name = match?.[1] || "menu-qr.png";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      toast.push("QR kod indirildi.");
    } catch (e) {
      toast.push(e.message || "QR indirilemedi.", "error");
    }
  }, [toast]);

  const exportJson = useCallback(async () => {
    try {
      const data = await apiRequest("/restaurant/menu/export", { method: "GET" });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-${menu?.slug || "export"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.push("JSON dosyası indirildi.");
    } catch (e) {
      toast.push(e.message || "Dışa aktarma başarısız.", "error");
    }
  }, [menu?.slug, toast]);

  const exportCsv = useCallback(() => {
    if (!menu) {
      return;
    }
    const lines = [["id", "urun_adi", "kategori", "fiyat", "yayinda", "eksik_diller"].join(",")];
    for (const item of allItems) {
      const name = (item.translations?.[0]?.item_name || "").replace(/"/g, '""');
      const miss = getMissingLangs(item, menu.supported_languages).join(" ");
      lines.push(
        [
          item.id,
          `"${name}"`,
          `"${String(item.categoryName || "").replace(/"/g, '""')}"`,
          item.price,
          item.is_published !== false ? "evet" : "hayir",
          `"${miss}"`
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urunler-${menu.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push("CSV indirildi.");
  }, [allItems, menu, toast]);

  if (!menu) {
    return <RestaurantAnalyticsSkeleton />;
  }

  return (
    <RestaurantPageShell>
      <SubpageIntro description="Müşteri trafiği, menüyü paylaşma ve veriyi dışa aktarma. Sayılar müşteri menüsü açıldıkça güncellenir." />

      {error ? <FlashBanner type="error">{error}</FlashBanner> : null}

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm ring-1 ring-indigo-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Bugün</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-indigo-950">{analytics.viewsToday}</p>
            <p className="mt-1 text-xs text-indigo-600/90">Menü görüntüleme</p>
          </div>
          <div className={ui.statCard}>
            <p className={ui.statLabel}>Son 7 gün</p>
            <p className={ui.statValue}>{analytics.viewsWeek}</p>
            <p className="mt-1 text-xs text-slate-500">Toplam görüntülenme</p>
          </div>
          <div className={ui.statCard}>
            <p className={ui.statLabel}>Son 30 gün</p>
            <p className={ui.statValue}>{analytics.viewsMonth}</p>
            <p className="mt-1 text-xs text-slate-500">Toplam görüntülenme</p>
          </div>
        </div>
      ) : null}

      {analytics?.topItems?.length ? (
        <div className={`${ui.card} p-5`}>
          <h3 className="text-sm font-semibold text-slate-900">En çok görüntülenen ürünler</h3>
          <p className="mt-1 text-xs text-slate-500">Düzenlemek için bir ürüne tıklayın.</p>
          <ol className="mt-4 flex flex-wrap gap-2">
            {analytics.topItems.map((t) => (
              <li key={t.id}>
                <Link
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50/80"
                  to={`/restaurant/items/${t.id}/edit`}
                >
                  {t.name}
                  <span className="tabular-nums text-slate-400">({t.viewCount})</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className={`${ui.card} p-5`}>
        <h3 className="text-sm font-semibold text-slate-900">Menüyü paylaşın</h3>
        <p className="mt-1 text-xs text-slate-500">
          Müşterilerinizin gördüğü sayfayı açın, linki kopyalayın veya QR kod indirin.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className={ui.secondaryBtn} href={publicMenuUrl} rel="noreferrer" target="_blank">
            Menüyü aç
          </a>
          <button className={ui.secondaryBtn} onClick={copyLink} type="button">
            Linki kopyala
          </button>
          <button className={ui.secondaryBtn} onClick={downloadQr} type="button">
            QR indir
          </button>
        </div>
      </div>

      <div className={`${ui.card} p-5`}>
        <h3 className="text-sm font-semibold text-slate-900">Veriyi dışa aktar</h3>
        <p className="mt-1 text-xs text-slate-500">Yedek veya Excel ile çalışmak için.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={ui.secondaryBtn} onClick={exportJson} type="button">
            JSON indir
          </button>
          <button className={ui.secondaryBtn} onClick={exportCsv} type="button">
            CSV indir
          </button>
        </div>
      </div>

      <section className={ui.cardMuted}>
        <h3 className="font-semibold text-slate-800">Not</h3>
        <p className="mt-2 leading-relaxed">
          Sayılar müşteri menüsü her açıldığında artar; aynı oturumda tekrar sayılabilir.
        </p>
      </section>
    </RestaurantPageShell>
  );
}
