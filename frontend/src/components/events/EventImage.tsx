"use client";

import { isBackendAssetUrl, resolveAssetUrl } from "@/lib/api-base";
import Image from "next/image";
import { useState } from "react";

interface EventImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function EventImage({ src, alt, className, fallback = "/api/files/default-banner" }: EventImageProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  // Resolve the image URL
  const resolvedSrc = src ? resolveAssetUrl(src) : "";

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Try fallback URL if original fails
      if (isBackendAssetUrl(resolvedSrc)) {
        setImgSrc(fallback);
      }
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <Image
      src={hasError && imgSrc ? imgSrc : resolvedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      width={400}
      height={225}
      style={{
        objectFit: "cover",
      }}
      unoptimized={isBackendAssetUrl(resolvedSrc)}
    />
  );
}
