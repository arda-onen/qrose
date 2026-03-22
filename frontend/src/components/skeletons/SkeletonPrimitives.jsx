/**
 * `.qrose-skeleton` — index.css (yavaş linear wave, dikişsiz döngü).
 */
export function SkBlock({ className = "", rounded = "rounded-lg" }) {
  return <div aria-hidden className={`qrose-skeleton ${rounded} ${className}`} />;
}

export function SkLine({ className = "" }) {
  return <SkBlock className={`h-3 ${className}`} rounded="rounded-md" />;
}

export function SkCircle({ className = "h-10 w-10" }) {
  return <SkBlock className={className} rounded="rounded-full" />;
}
