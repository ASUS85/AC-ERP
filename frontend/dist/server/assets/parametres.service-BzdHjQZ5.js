import { jsx } from "react/jsx-runtime";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { c as cn, i as api } from "./router-soiu03Zn.js";
const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
const apiUrl = "http://localhost:3000/api/v1";
const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
function resolveAvatarUrl(avatar) {
  if (!avatar) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(avatar)) return avatar;
  return `${apiOrigin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
}
const getEntreprise = () => api.get("/parametres/entreprise");
const updateEntreprise = (data) => api.put("/parametres/entreprise", data);
const getSysteme = () => api.get("/parametres/systeme");
const updateSysteme = (data) => api.put("/parametres/systeme", data);
const updateMaintenance = (active) => api.patch("/parametres/systeme/maintenance", { active });
const getJournal = (params) => api.get("/parametres/journal", { params });
export {
  Avatar as A,
  AvatarImage as a,
  AvatarFallback as b,
  getJournal as c,
  getSysteme as d,
  updateMaintenance as e,
  updateSysteme as f,
  getEntreprise as g,
  resolveAvatarUrl as r,
  updateEntreprise as u
};
