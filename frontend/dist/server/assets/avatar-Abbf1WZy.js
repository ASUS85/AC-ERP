const apiUrl = "http://localhost:3000/api/v1";
const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}
function resolveAvatarUrl(avatar) {
  return resolveMediaUrl(avatar);
}
export {
  resolveMediaUrl as a,
  resolveAvatarUrl as r
};
