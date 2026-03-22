/**
 * Restoran paneli — tutarlı Tailwind sınıfları (tek kaynak).
 */
export const ui = {
  /** Ana içerik sarmalayıcı */
  shell: "mx-auto w-full max-w-6xl space-y-8 pb-10",

  input:
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
  inputSearch:
    "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",

  /** Ürünler sayfası — sade arama satırı */
  productsSearchCard: "max-w-3xl rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4",
  productsSearchInput:
    "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200",
  /** Sağdaki sayım metni (rozet değil) */
  productsSearchMeta: "flex shrink-0 items-center gap-1.5 text-sm tabular-nums text-slate-600",
  label: "mb-1.5 block text-xs font-medium text-slate-600",

  /** Birincil buton içinde dönen gösterge (beyaz) */
  btnSpinner:
    "inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white",
  primaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
  secondaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
  subtleBtn:
    "inline-flex items-center justify-center rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50",
  dangerBtn:
    "inline-flex items-center justify-center rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700",

  /** İç boşluk kullanan sayfalar `p-5` veya `p-6` ekleyin */
  card:
    "rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5",
  cardMuted: "rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600",

  /** Sade tablo: ince çerçeve, normal yazı başlıklar */
  tableWrap: "overflow-x-auto rounded-lg border border-slate-200 bg-white",
  tableHeadCell:
    "border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-medium text-slate-600",
  tableHeadCellRight: "border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-right text-sm font-medium text-slate-600",
  tableSortBtn: "text-slate-700 underline-offset-2 hover:text-indigo-600 hover:underline",
  tableRow: "border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/90",
  tableRowMuted: "border-b border-slate-100 transition last:border-b-0 bg-amber-50/35 hover:bg-amber-50/55",
  linkCell: "text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline",
  dangerCell: "text-sm font-medium text-red-600 hover:text-red-800 hover:underline",

  /** Tablo satırı işlemleri: ikon grubu */
  tableActionsGroup:
    "inline-flex items-center gap-0.5 rounded-lg border border-slate-200/90 bg-slate-50/95 p-0.5 shadow-sm",
  tableIconBtn:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-indigo-600 hover:shadow-sm",
  tableIconBtnDanger:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-red-600 hover:shadow-sm",

  statCard: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/5",
  statLabel: "text-xs font-medium uppercase tracking-wide text-slate-500",
  statValue: "mt-1 text-2xl font-bold tabular-nums text-slate-900",

  bulkBar:
    "flex flex-wrap items-center gap-2 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm shadow-sm",

  linkCard:
    "group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:border-indigo-200 hover:shadow-md"
};
