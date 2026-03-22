import { useId, useRef, useState } from "react";

/**
 * Gizli file input + özelleştirilmiş buton (native "Dosya seç" yerine).
 */
export default function FilePicker({
  accept = "image/*",
  onFileChange,
  buttonLabel = "Dosya seç",
  emptyHint = "Henüz dosya seçilmedi",
  className = ""
}) {
  const inputRef = useRef(null);
  const generatedId = useId();
  const inputId = `file-${generatedId}`;
  const [fileName, setFileName] = useState("");

  function handleChange(event) {
    const file = event.target.files?.[0] || null;
    setFileName(file ? file.name : "");
    onFileChange?.(file);
  }

  function handleButtonClick() {
    inputRef.current?.click();
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        accept={accept}
        className="sr-only"
        id={inputId}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          aria-label={buttonLabel}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
          onClick={handleButtonClick}
          type="button"
        >
          {buttonLabel}
        </button>
        <span className="min-w-0 flex-1 truncate text-xs text-slate-500" title={fileName || undefined}>
          {fileName || emptyHint}
        </span>
      </div>
    </div>
  );
}
