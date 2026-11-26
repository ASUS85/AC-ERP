import { API_ORIGIN } from "./api/config";

export function resolveMediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

export function resolveAvatarUrl(avatar?: string | null) {
  return resolveMediaUrl(avatar);
}
