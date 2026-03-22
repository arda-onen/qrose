import { useEffect, useState } from "react";
import { FlashBanner, RestaurantPageShell } from "../components/restaurant/RestaurantChrome";
import { API_BASE_URL, apiRequest } from "../lib/api";
import { ui } from "../lib/restaurantDashboardUi";

async function downloadTableQrPng(tableId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/restaurant/tables/${tableId}/qr`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    let msg = "İndirilemedi.";
    try {
      const j = await res.json();
      msg = j.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `masa-${tableId}-qr.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RestaurantTablesPage() {
  const [tables, setTables] = useState([]);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    const data = await apiRequest("/restaurant/tables");
    setSlug(data.slug || "");
    setTables(Array.isArray(data.tables) ? data.tables : []);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    setNotice("");
    setError("");
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }
    try {
      await apiRequest("/restaurant/tables", {
        method: "POST",
        body: JSON.stringify({ label: trimmed })
      });
      setLabel("");
      setNotice("Masa eklendi. QR’ı indirip masaya koyun.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCopy(url) {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Link kopyalandı.");
    } catch {
      setError("Panoya kopyalanamadı.");
    }
  }

  async function onQr(id) {
    setError("");
    try {
      await downloadTableQrPng(id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Bu masayı ve QR bağlantısını silmek istiyor musunuz?")) {
      return;
    }
    setError("");
    try {
      await apiRequest(`/restaurant/tables/${id}`, { method: "DELETE" });
      setNotice("Masa silindi.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <RestaurantPageShell>
      <p className="text-sm leading-relaxed text-slate-600">
        Her masa için ayrı QR üretin. Müşteri bu QR ile menüyü açtığında{" "}
        <strong className="text-slate-800">Garson çağır</strong> düğmesi görünür; çağrı panelde anında listelenir.
      </p>

      {error ? <FlashBanner type="error">{error}</FlashBanner> : null}
      {notice ? <FlashBanner type="success">{notice}</FlashBanner> : null}

      <form className={`${ui.card} max-w-xl p-4`} onSubmit={onAdd}>
        <label className={ui.label} htmlFor="table-label">
          Yeni masa adı
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end">
          <input
            className={ui.input}
            id="table-label"
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Örn. Masa 12, Teras 3"
            value={label}
          />
          <button className={`${ui.primaryBtn} shrink-0`} disabled={loading} type="submit">
            Masa ekle
          </button>
        </div>
      </form>

      <div className={ui.tableWrap}>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className={ui.tableHeadCell}>Masa</th>
              <th className={ui.tableHeadCell}>Bağlantı</th>
              <th className={ui.tableHeadCellRight}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={3}>
                  Yükleniyor…
                </td>
              </tr>
            ) : tables.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={3}>
                  Henüz masa yok. Yukarıdan ekleyin.
                </td>
              </tr>
            ) : (
              tables.map((t) => (
                <tr className={ui.tableRow} key={t.id}>
                  <td className="border-b border-slate-100 px-3 py-3 font-medium text-slate-900">{t.label}</td>
                  <td className="border-b border-slate-100 px-3 py-3">
                    <p className="max-w-[min(100%,280px)] truncate font-mono text-xs text-slate-600" title={t.menu_url}>
                      {t.menu_url}
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1">
                      <button
                        className={ui.subtleBtn}
                        onClick={() => onCopy(t.menu_url)}
                        type="button"
                      >
                        Kopyala
                      </button>
                      <button className={ui.subtleBtn} onClick={() => onQr(t.id)} type="button">
                        QR indir
                      </button>
                      <button
                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
                        onClick={() => onDelete(t.id)}
                        type="button"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {slug ? (
        <section className={ui.cardMuted}>
          <p className="text-sm text-slate-600">
            QR’daki tam adres, sunucuda tanımlı <code className="text-xs">PUBLIC_BASE_URL</code> ile üretilir. Masa
            olmadan açılan genel menüde &quot;Garson çağır&quot; görünmez; sadece{" "}
            <code className="rounded bg-white px-1 py-0.5 text-xs">?t=…</code> ile açılınca aktif olur.
          </p>
        </section>
      ) : null}
    </RestaurantPageShell>
  );
}
