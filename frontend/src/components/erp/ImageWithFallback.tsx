import { useState, type ReactNode } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
};

// Shows `fallback` instead of a broken image icon when the src is missing or fails to load
// (e.g. an upload that no longer exists on the server's ephemeral storage).
export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback}</>;

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
