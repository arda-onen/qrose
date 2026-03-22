import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import WaiterCallAlertModal from "../components/WaiterCallAlertModal";
import { FlashBanner, RestaurantPageShell } from "../components/restaurant/RestaurantChrome";
import { RestaurantDashboardSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { useToast } from "../context/ToastContext";
import { apiRequest } from "../lib/api";
import { playWaiterAlertSound } from "../lib/playWaiterAlertSound";
import { ui } from "../lib/restaurantDashboardUi";
import { useWaiterCallsStream } from "../lib/useWaiterCallsStream";
import {
  CategoryRow,
  countMissingTranslations,
  formatDateTime,
  getLastUpdatedIso,
  Hint
} from "../lib/restaurantDashboardUtils";

function QuickLinkCard({ to, title, body, icon }) {
  return (
    <Link className={ui.linkCard} to={to}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
          <span className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 group-hover:underline">
            Aç
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatCallTime(iso) {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short"
    });
  } catch {
    return String(iso);
  }
}

export default function RestaurantDashboard() {
  const toast = useToast();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { calls: waiterCalls, connected: waiterSse, refresh: refreshWaiterCalls } = useWaiterCallsStream();
  const seenWaiterCallIdsRef = useRef(null);
  const [waiterAlertLabels, setWaiterAlertLabels] = useState(null);
  const [waiterBannerPulse, setWaiterBannerPulse] = useState(false);

  useEffect(() => {
    if (seenWaiterCallIdsRef.current === null) {
      seenWaiterCallIdsRef.current = new Set(waiterCalls.map((c) => c.id));
      return;
    }
    const prev = seenWaiterCallIdsRef.current;
    const newcomers = waiterCalls.filter((c) => !prev.has(c.id));
    seenWaiterCallIdsRef.current = new Set(waiterCalls.map((c) => c.id));

    if (newcomers.length === 0) {
      return;
    }

    playWaiterAlertSound();
    const labels = newcomers.map((c) => c.table_label);
    newcomers.forEach((c) => {
      toast.push(`🔔 Garson çağrısı: ${c.table_label}`, "alert", 6000);
    });
    setWaiterAlertLabels(labels);
    setWaiterBannerPulse(true);
    const t = window.setTimeout(() => setWaiterBannerPulse(false), 6000);
    const prevTitle = document.title;
    document.title = `🔔 Garson — ${labels[0] || "çağrı"}`;
    const titleTimer = window.setTimeout(() => {
      document.title = prevTitle;
    }, 5200);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(titleTimer);
    };
  }, [waiterCalls, toast]);

  async function loadMenu() {
    const data = await apiRequest("/restaurant/menu");
    setMenu(data);
    setError("");
    return data;
  }

  useEffect(() => {
    (async () => {
      try {
        await loadMenu();
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  const allItems = useMemo(() => {
    if (!menu) {
      return [];
    }
    return menu.categories.flatMap((c) => c.items);
  }, [menu]);

  const lastUpdatedIso = menu ? getLastUpdatedIso(menu) : null;
  const missingTrCount = menu ? countMissingTranslations(menu) : 0;

  async function resolveWaiterCall(callId) {
    try {
      await apiRequest(`/restaurant/waiter-calls/${callId}/resolve`, { method: "POST" });
      toast.push("Garson çağrısı kapatıldı.");
      await refreshWaiterCalls();
    } catch (e) {
      toast.push(e.message || "İşlem yapılamadı.", "error");
    }
  }

  async function executeDelete() {
    if (!deleteModal) {
      return;
    }
    setDeleteLoading(true);
    setError("");
    try {
      await apiRequest(`/restaurant/categories/${deleteModal.id}`, { method: "DELETE" });
      setNotice("Kategori silindi.");
      setDeleteModal(null);
      await loadMenu();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  const deleteModalCopy = deleteModal
    ? {
        title: "Kategoriyi silmek istediğinize emin misiniz?",
        message:
          "Bu kategori ve içindeki tüm ürünler kalıcı olarak silinecek. Bu işlem geri alınamaz.",
        confirmLabel: "Evet, kategoriyi sil"
      }
    : { title: "", message: "", confirmLabel: "" };

  if (!menu) {
    return <RestaurantDashboardSkeleton />;
  }

  return (
    <RestaurantPageShell>
      <ConfirmModal
        cancelLabel="Vazgeç"
        confirmLabel={deleteModalCopy.confirmLabel}
        loading={deleteLoading}
        message={deleteModalCopy.message}
        onCancel={() => !deleteLoading && setDeleteModal(null)}
        onConfirm={executeDelete}
        open={Boolean(deleteModal)}
        title={deleteModalCopy.title}
      />

      <WaiterCallAlertModal
        onDismiss={() => setWaiterAlertLabels(null)}
        open={Boolean(waiterAlertLabels?.length)}
        tableLabels={waiterAlertLabels || []}
      />

      {error ? <FlashBanner type="error">{error}</FlashBanner> : null}
      {notice ? <FlashBanner type="success">{notice}</FlashBanner> : null}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">Garson çağrıları</span>
          <span
            className={`h-2 w-2 rounded-full ${waiterSse ? "bg-emerald-500" : "bg-amber-400"}`}
            title={waiterSse ? "Canlı bağlantı" : "Yeniden bağlanıyor / yedek yenileme"}
          />
        </div>
        <Link className="text-sm font-medium text-indigo-600 hover:underline" to="/restaurant/tables">
          Masalar &amp; QR
        </Link>
      </div>

      {waiterCalls.length > 0 ? (
        <div
          className={`rounded-xl border-2 px-4 py-4 shadow-md transition-[box-shadow] duration-300 ${
            waiterBannerPulse
              ? "border-amber-500 bg-gradient-to-br from-amber-50 via-amber-100/80 to-orange-50 shadow-[0_0_0_4px_rgba(251,191,36,0.55),0_12px_32px_rgba(180,83,9,0.2)]"
              : "border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/60 ring-2 ring-amber-300/40"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </span>
              <div>
                <p className="text-base font-bold text-amber-950">Garson bekleniyor</p>
                <p className="text-xs font-medium text-amber-900/90">
                  {waiterCalls.length} aktif çağrı — masaya gidin
                </p>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {waiterCalls.map((c) => (
              <li
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-white px-3 py-2.5 text-sm shadow-sm"
                key={c.id}
              >
                <div>
                  <span className="text-base font-bold text-slate-900">{c.table_label}</span>
                  <span className="ml-2 tabular-nums text-slate-600">{formatCallTime(c.requested_at)}</span>
                </div>
                <button
                  className={`${ui.subtleBtn} font-semibold text-emerald-900 ring-emerald-300 hover:bg-emerald-50`}
                  onClick={() => resolveWaiterCall(c.id)}
                  type="button"
                >
                  Gidildi
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Aktif garson çağrısı yok. Masa QR’larını{" "}
          <Link className="font-medium text-indigo-600 underline" to="/restaurant/tables">
            Masalar
          </Link>{" "}
          sayfasından oluşturun.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLinkCard
          body="Arama, sıralama, çoklu seçim ve taslak/yayın yönetimi."
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth={1.5} />
            </svg>
          }
          title="Ürünler"
          to="/restaurant/products"
        />
        <QuickLinkCard
          body="Görüntülenme, QR kod, menü linki ve CSV/JSON dışa aktarma."
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth={1.5} />
            </svg>
          }
          title="İstatistik & paylaşım"
          to="/restaurant/analytics"
        />
        <QuickLinkCard
          body="Masa başına QR; müşteri garson çağırınca panelde görünür."
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 12h16M12 4v16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            </svg>
          }
          title="Masalar & garson"
          to="/restaurant/tables"
        />
        <QuickLinkCard
          body="Tema, dil, iletişim, görseller ve menü kimliği."
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
            </svg>
          }
          title="Menü ayarları"
          to="/restaurant/settings"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={ui.statCard}>
          <p className={ui.statLabel}>
            Kategoriler
            <Hint text="Menünüzde tanımlı kategori sayısı" />
          </p>
          <p className={ui.statValue}>{menu.categories.length}</p>
        </div>
        <div className={ui.statCard}>
          <p className={ui.statLabel}>
            Ürünler
            <Hint text="Tüm kategorilerdeki toplam ürün" />
          </p>
          <p className={ui.statValue}>{allItems.length}</p>
        </div>
        <div className={ui.statCard}>
          <p className={ui.statLabel}>
            Eksik çeviri
            <Hint text="Bir dilde adı boş olan ürün-dil çifti sayısı" />
          </p>
          <p className={`${ui.statValue} text-amber-700`}>{missingTrCount}</p>
        </div>
        <div className={ui.statCard}>
          <p className={ui.statLabel}>
            Son güncelleme
            <Hint text="Ürün kayıtlarındaki en son değişiklik zamanı" />
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(lastUpdatedIso)}</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kategoriler</h2>
          <Link className={ui.primaryBtn} to="/restaurant/categories/new">
            + Kategori ekle
          </Link>
        </div>
        <div className={ui.tableWrap}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className={ui.tableHeadCell}>Kategori</th>
                <th className={ui.tableHeadCell}>Ürün sayısı</th>
                <th className={ui.tableHeadCellRight}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {menu.categories.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500" colSpan={3}>
                    <p className="font-medium text-slate-800">Henüz kategori yok</p>
                    <p className="mt-1 text-sm text-slate-500">İlk kategorinizi ekleyerek başlayın.</p>
                    <Link className={`${ui.primaryBtn} mt-4 inline-flex`} to="/restaurant/categories/new">
                      Kategori oluştur
                    </Link>
                  </td>
                </tr>
              ) : (
                menu.categories.map((category) => (
                  <CategoryRow
                    category={category}
                    key={category.id}
                    menu={menu}
                    onRequestDeleteCategory={(id) => setDeleteModal({ id })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={ui.cardMuted}>
        <h3 className="font-semibold text-slate-800">İpuçları</h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-slate-600">
          <li>
            <strong className="text-slate-700">Taslak</strong> ürünler müşteri menüsünde görünmez.
          </li>
          <li>
            Ürün listesindeki sarı <strong className="text-slate-700">dil rozetleri</strong>, o dilde ürün adının boş
            olduğunu gösterir; veritabanındaki kod büyük/küçük harften bağımsız eşleşir.
          </li>
        </ul>
      </section>
    </RestaurantPageShell>
  );
}
