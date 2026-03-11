import { useState } from "react";

export default function MenuImage({ alt, src, className = "", wrapperClassName = "" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <div className={`menu-image-wrap ${wrapperClassName}`}>
      <div className={`menu-image-skeleton ${isLoaded ? "opacity-0" : "opacity-100"}`} />
      <img
        alt={alt}
        className={`${className} menu-image ${isLoaded ? "menu-image-loaded" : "menu-image-loading"}`}
        decoding="async"
        loading="lazy"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        src={src}
      />
    </div>
  );
}
