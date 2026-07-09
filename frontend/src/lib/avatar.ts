const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");

export function resolveAvatarUrl(avatar?: string | null) {
  if (!avatar) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(avatar)) return avatar;
  return `${apiOrigin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
}
