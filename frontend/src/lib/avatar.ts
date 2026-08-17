const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");

export function resolveMediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}

export function resolveAvatarUrl(avatar?: string | null) {
  return resolveMediaUrl(avatar);
}
