const apiUrl = "http://localhost:3000/api/v1";
const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
function resolveAvatarUrl(avatar) {
  if (!avatar) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(avatar)) return avatar;
  return `${apiOrigin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
}
export {
  resolveAvatarUrl as r
};
