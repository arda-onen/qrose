import { Link } from "react-router-dom";
import { apiFileUrl } from "./api";
import { languageLabel, normalizeLangCode } from "./languageLabels";
import {
  formatPrice,
  getCategoryDisplayNameForAdmin,
  getCategoryShortDescriptionForAdmin
} from "./menuThemeUtils";
import { ui } from "./restaurantDashboardUi";

function IconPencil() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Düzenle / sil — ikon + tooltip */
export function TableRowActions({ editTo, editTitle = "Düzenle", onDelete, deleteTitle = "Sil" }) {
  return (
    <div className={ui.tableActionsGroup}>
      <Link aria-label={editTitle} className={ui.tableIconBtn} title={editTitle} to={editTo}>
        <IconPencil />
      </Link>
      <button
        aria-label={deleteTitle}
        className={ui.tableIconBtnDanger}
        onClick={onDelete}
        title={deleteTitle}
        type="button"
      >
        <IconTrash />
      </button>
    </div>
  );
}

export function Hint({ text }) {
  return (
    <span
      className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500"
      title={text}
    >
      ?
    </span>
  );
}

export function getMissingLangs(item, supportedLanguages) {
  const raw = supportedLanguages || [];
  const translations = item.translations || [];
  const byNorm = new Map();
  for (const t of translations) {
    const k = normalizeLangCode(t.language_code);
    if (k && !byNorm.has(k)) {
      byNorm.set(k, t);
    }
  }
  const missing = [];
  for (const lang of raw) {
    const k = normalizeLangCode(lang);
    if (!k) {
      continue;
    }
    const tr = byNorm.get(k);
    if (!tr || !String(tr.item_name || "").trim()) {
      missing.push(String(lang).trim());
    }
  }
  return missing;
}

export function countMissingTranslations(menu) {
  if (!menu?.categories) {
    return 0;
  }
  let n = 0;
  const langs = menu.supported_languages || [];
  for (const c of menu.categories) {
    for (const i of c.items) {
      n += getMissingLangs(i, langs).length;
    }
  }
  return n;
}

export function getLastUpdatedIso(menu) {
  let max = null;
  for (const c of menu.categories || []) {
    for (const i of c.items || []) {
      const t = i.updated_at || i.created_at;
      if (t && (!max || new Date(t) > new Date(max))) {
        max = t;
      }
    }
  }
  return max;
}

export function formatDateTime(iso) {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CategoryRow({ category, menu, onRequestDeleteCategory }) {
  const name = getCategoryDisplayNameForAdmin(category, menu.supported_languages);
  const desc = getCategoryShortDescriptionForAdmin(category, menu.supported_languages);
  const thumb = category.image ? (
    <img
      alt=""
      className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
      src={category.image.startsWith("/uploads/") ? apiFileUrl(category.image) : category.image}
    />
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
      —
    </div>
  );

  return (
    <tr className={ui.tableRow}>
      <td className="max-w-md px-3 py-3">
        <div className="flex items-start gap-3">
          {thumb}
          <div className="min-w-0">
            <div className="font-medium text-slate-900">{name}</div>
            {desc ? (
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">{desc}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-600">{category.items.length}</td>
      <td className="whitespace-nowrap px-3 py-3 text-right">
        <TableRowActions
          editTo={`/restaurant/categories/${category.id}/edit`}
          onDelete={() => onRequestDeleteCategory(category.id)}
        />
      </td>
    </tr>
  );
}

export function ItemRow({ item, menu, onRequestDeleteItem, onToggleSelect, selected }) {
  const itemName = item.translations?.[0]?.item_name || `Ürün #${item.id}`;
  const missing = getMissingLangs(item, menu.supported_languages);
  const draft = item.is_published === false;
  const rowClass = draft ? ui.tableRowMuted : ui.tableRow;

  return (
    <tr className={rowClass}>
      <td className="w-10 px-2 py-2.5 align-middle">
        <input
          aria-label={`Seç ${itemName}`}
          checked={selected}
          className="rounded border-slate-300"
          onChange={() => onToggleSelect(item.id)}
          type="checkbox"
        />
      </td>
      <td className="min-w-[140px] px-3 py-2.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-medium text-slate-900">{itemName}</span>
          {draft ? <span className="text-xs text-amber-700">Taslak</span> : null}
        </div>
      </td>
      <td className="max-w-[120px] truncate px-3 py-2.5 text-slate-600" title={item.categoryName}>
        {item.categoryName}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-800">{formatPrice(item.price)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">{item.sort_order ?? 0}</td>
      <td className="max-w-[min(200px,28vw)] px-3 py-2.5">
        {missing.length === 0 ? (
          <span className="text-sm text-slate-400" title="Tüm desteklenen dillerde ürün adı girilmiş">
            —
          </span>
        ) : (
          <div className="flex flex-wrap gap-1" title={missing.map((c) => `${languageLabel(c)} (${c})`).join(" · ")}>
            {missing.map((code) => (
              <span
                className="inline-flex max-w-full items-center rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase leading-none text-amber-950 ring-1 ring-amber-200/80"
                key={code}
              >
                {normalizeLangCode(code) || code}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-2.5">
        {item.image ? (
          <img
            alt=""
            className="h-9 w-12 rounded border border-slate-200 object-cover"
            src={item.image.startsWith("/uploads/") ? apiFileUrl(item.image) : item.image}
          />
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">
        {formatDateTime(item.updated_at || item.created_at)}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <TableRowActions
          editTo={`/restaurant/items/${item.id}/edit`}
          onDelete={() => onRequestDeleteItem(item.id)}
        />
      </td>
    </tr>
  );
}
