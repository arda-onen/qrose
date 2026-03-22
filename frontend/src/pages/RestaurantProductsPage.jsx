import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { FlashBanner, RestaurantPageShell, SubpageIntro } from "../components/restaurant/RestaurantChrome";
import { RestaurantProductsSkeleton } from "../components/skeletons/RestaurantSkeletons";
import { apiRequest } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { ui } from "../lib/restaurantDashboardUi";
import { ItemRow } from "../lib/restaurantDashboardUtils";
import { getCategoryDisplayNameForAdmin } from "../lib/menuThemeUtils";

const PAGE_SIZE = 15;

export default function RestaurantProductsPage() {
  const toast = useToast();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(() => new Set());
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");

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
    return menu.categories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: getCategoryDisplayNameForAdmin(category, menu.supported_languages),
        categoryId: category.id
      }))
    );
  }, [menu]);

  const filteredSorted = useMemo(() => {
    let rows = allItems;
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((item) => {
        const fromTranslations = (item.translations || [])
          .flatMap((t) => [t.item_name, t.description])
          .filter(Boolean)
          .join(" ");
        return (
          String(fromTranslations).toLowerCase().includes(q) ||
          String(item.categoryName || "").toLowerCase().includes(q) ||
          String(item.id).includes(q)
        );
      });
    }
    const dir = sortDir === "desc" ? -1 : 1;
    const sorted = [...rows].sort((a, b) => {
      if (sortKey === "price") {
        return (Number(a.price) - Number(b.price)) * dir;
      }
      if (sortKey === "sort_order") {
        return ((a.sort_order ?? 0) - (b.sort_order ?? 0)) * dir;
      }
      if (sortKey === "updated_at") {
        const ta = new Date(a.updated_at || a.created_at || 0).getTime();
        const tb = new Date(b.updated_at || b.created_at || 0).getTime();
        return (ta - tb) * dir;
      }
      if (sortKey === "category") {
        return String(a.categoryName || "").localeCompare(String(b.categoryName || ""), "tr") * dir;
      }
      const na = a.translations?.[0]?.item_name || "";
      const nb = b.translations?.[0]?.item_name || "";
      return String(na).localeCompare(String(nb), "tr") * dir;
    });
    return sorted;
  }, [allItems, search, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
    setPage((p) => Math.min(p, tp));
  }, [filteredSorted.length]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, pageClamped]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    const ids = pageItems.map((i) => i.id);
    const allOnPage = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function executeDelete() {
    if (!deleteModal) {
      return;
    }
    setDeleteLoading(true);
    setError("");
    try {
      if (deleteModal.type === "item") {
        await apiRequest(`/restaurant/items/${deleteModal.id}`, { method: "DELETE" });
        toast.push("Ürün silindi.");
      } else if (deleteModal.type === "bulk") {
        await apiRequest("/restaurant/items/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids: deleteModal.ids })
        });
        toast.push(`${deleteModal.ids.length} ürün silindi.`);
        setSelected(new Set());
      }
      setDeleteModal(null);
      await loadMenu();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function runBulkMove() {
    if (!bulkCategoryId || selected.size === 0) {
      return;
    }
    try {
      await apiRequest("/restaurant/items/bulk-move", {
        method: "PUT",
        body: JSON.stringify({ ids: [...selected], category_id: Number(bulkCategoryId) })
      });
      toast.push("Ürünler taşındı.");
      setBulkMoveOpen(false);
      setSelected(new Set());
      await loadMenu();
    } catch (e) {
      toast.push(e.message || "Taşınamadı.", "error");
    }
  }

  async function runBulkPublish(pub) {
    if (selected.size === 0) {
      return;
    }
    try {
      await apiRequest("/restaurant/items/bulk-publish", {
        method: "PUT",
        body: JSON.stringify({ ids: [...selected], is_published: pub })
      });
      toast.push(pub ? "Seçilenler yayına alındı." : "Seçilenler taslağa alındı.");
      setSelected(new Set());
      await loadMenu();
    } catch (e) {
      toast.push(e.message || "İşlem başarısız.", "error");
    }
  }

  const deleteModalCopy =
    deleteModal?.type === "item"
      ? {
          title: "Ürünü silmek istediğinize emin misiniz?",
          message: "Bu ürün kalıcı olarak silinecek. Bu işlem geri alınamaz.",
          confirmLabel: "Evet, ürünü sil"
        }
      : deleteModal?.type === "bulk"
        ? {
            title: `${deleteModal.ids?.length || 0} ürünü silmek istediğinize emin misiniz?`,
            message: "Seçili ürünler kalıcı olarak silinecek.",
            confirmLabel: "Evet, sil"
          }
        : { title: "", message: "", confirmLabel: "" };

  if (!menu) {
    return <RestaurantProductsSkeleton />;
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

      {bulkMoveOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            aria-label="Kapat"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setBulkMoveOpen(false)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl ring-1 ring-slate-900/5">
            <h2 className="text-lg font-semibold text-slate-900">Seçili ürünleri taşı</h2>
            <p className="mt-1 text-sm text-slate-600">{selected.size} ürün seçildi.</p>
            <label className={`${ui.label} mt-4`} htmlFor="bulk-cat">
              Hedef kategori
            </label>
            <select
              className={`${ui.input} mt-1`}
              id="bulk-cat"
              onChange={(e) => setBulkCategoryId(e.target.value)}
              value={bulkCategoryId}
            >
              <option value="">Seçin</option>
              {menu.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryDisplayNameForAdmin(c, menu.supported_languages)}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button className={ui.secondaryBtn} onClick={() => setBulkMoveOpen(false)} type="button">
                İptal
              </button>
              <button className={ui.primaryBtn} onClick={runBulkMove} type="button">
                Taşı
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <SubpageIntro description="Listeyi sıralayın, arayın veya seçin. Sarı rozetler o dilde ürün adı eksik demektir (TR ile tr aynı sayılır)." />
        </div>
        <Link className={`${ui.primaryBtn} shrink-0 self-start sm:self-auto`} to="/restaurant/items/new">
          + Yeni ürün
        </Link>
      </div>

      {error ? <FlashBanner type="error">{error}</FlashBanner> : null}

      <section aria-label="Ürün arama" className={ui.productsSearchCard}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative min-w-0 flex-1">
            <svg
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <input
              aria-label="Ürün ara"
              autoComplete="off"
              className={ui.productsSearchInput}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara: ürün adı, kategori, açıklama, ürün no…"
              type="search"
              value={search}
            />
            {search.trim() ? (
              <button
                aria-label="Aramayı temizle"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setSearch("")}
                type="button"
              >
                <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            ) : null}
          </div>
          <div className={`${ui.productsSearchMeta} sm:justify-end`}>
            {search.trim() ? (
              <>
                <span className="text-slate-900">{filteredSorted.length}</span>
                <span className="text-slate-300">/</span>
                <span>{allItems.length}</span>
                <span className="hidden text-slate-500 sm:inline">eşleşme</span>
              </>
            ) : (
              <>
                <span className="text-slate-900">{allItems.length}</span>
                <span className="text-slate-500">ürün</span>
              </>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
          {search.trim() ? (
            <>
              {filteredSorted.length === 0 ? (
                <span>Sonuç yok — farklı bir kelime deneyin.</span>
              ) : (
                <span>{filteredSorted.length} sonuç.</span>
              )}{" "}
              <button
                className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                onClick={() => setSearch("")}
                type="button"
              >
                Tümünü göster
              </button>
            </>
          ) : (
            "Ad, açıklama (tüm diller), kategori ve ürün numarasına göre aranır."
          )}
        </p>
      </section>

      {selected.size > 0 ? (
        <div className={ui.bulkBar}>
          <span className="font-semibold text-amber-950">{selected.size} seçili</span>
          <span className="hidden h-4 w-px bg-amber-200 sm:inline" aria-hidden />
          <button
            className={ui.subtleBtn}
            onClick={() => {
              setBulkCategoryId(menu.categories[0] ? String(menu.categories[0].id) : "");
              setBulkMoveOpen(true);
            }}
            type="button"
          >
            Taşı
          </button>
          <button className={ui.subtleBtn} onClick={() => runBulkPublish(true)} type="button">
            Yayına al
          </button>
          <button className={ui.subtleBtn} onClick={() => runBulkPublish(false)} type="button">
            Taslağa al
          </button>
          <button
            className={ui.dangerBtn}
            onClick={() => setDeleteModal({ type: "bulk", ids: [...selected] })}
            type="button"
          >
            Sil
          </button>
          <button
            className="text-xs font-medium text-amber-900 underline underline-offset-2"
            onClick={() => setSelected(new Set())}
            type="button"
          >
            Seçimi temizle
          </button>
        </div>
      ) : null}

      <div className={ui.tableWrap}>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className={`${ui.tableHeadCell} w-11`}>
                <input
                  aria-label="Sayfadakilerin tümünü seç"
                  checked={pageItems.length > 0 && pageItems.every((i) => selected.has(i.id))}
                  className="rounded border-slate-300"
                  onChange={toggleSelectAllOnPage}
                  type="checkbox"
                />
              </th>
              <th className={ui.tableHeadCell}>
                <button className={ui.tableSortBtn} onClick={() => toggleSort("name")} type="button">
                  Ürün adı {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className={ui.tableHeadCell}>
                <button className={ui.tableSortBtn} onClick={() => toggleSort("category")} type="button">
                  Kategori {sortKey === "category" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className={ui.tableHeadCell}>
                <button className={ui.tableSortBtn} onClick={() => toggleSort("price")} type="button">
                  Fiyat {sortKey === "price" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className={ui.tableHeadCell}>
                <button className={ui.tableSortBtn} onClick={() => toggleSort("sort_order")} type="button">
                  Sıra {sortKey === "sort_order" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className={ui.tableHeadCell} title="İsim girilmemiş dil kodları">
                Eksik dil
              </th>
              <th className={ui.tableHeadCell}>Foto</th>
              <th className={ui.tableHeadCell}>
                <button className={ui.tableSortBtn} onClick={() => toggleSort("updated_at")} type="button">
                  Son güncelleme {sortKey === "updated_at" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className={ui.tableHeadCellRight}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {allItems.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={9}>
                  <p className="font-medium text-slate-800">Henüz ürün yok</p>
                  <Link className={`${ui.primaryBtn} mt-4 inline-flex`} to="/restaurant/items/new">
                    Ürün ekle
                  </Link>
                </td>
              </tr>
            ) : filteredSorted.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                  Aramanızla eşleşen ürün yok.
                </td>
              </tr>
            ) : (
              pageItems.map((item) => (
                <ItemRow
                  item={item}
                  key={item.id}
                  menu={menu}
                  onRequestDeleteItem={(id) => setDeleteModal({ type: "item", id })}
                  onToggleSelect={toggleSelect}
                  selected={selected.has(item.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredSorted.length > PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="tabular-nums">
            Sayfa {pageClamped} / {totalPages} · {filteredSorted.length} ürün
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40"
              disabled={pageClamped <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              Önceki
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40"
              disabled={pageClamped >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              type="button"
            >
              Sonraki
            </button>
          </div>
        </div>
      ) : null}
    </RestaurantPageShell>
  );
}
