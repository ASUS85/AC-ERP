import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";
import { Check, BarChart3, Zap, ShieldCheck, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { c as cn, I as Input, B as Button } from "./input-BiB-PFhx.js";
import { L as Label } from "./label-D4W0VQAM.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import axios from "axios";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 3e4
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshing = false;
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.error?.code;
    if (error.response?.status === 401 && code === "TOKEN_EXPIRED" && original && !original._retry && !refreshing) {
      original._retry = true;
      refreshing = true;
      try {
        const refreshToken = localStorage.getItem("erp_refresh_token");
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const accessToken = response.data?.data?.accessToken;
        localStorage.setItem("erp_access_token", accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("erp_access_token");
        localStorage.removeItem("erp_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error.response?.data?.error || { code: "NETWORK_ERROR", message: error.message, details: null });
  }
);
async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const { accessToken, refreshToken: refreshToken2, user } = response.data;
  localStorage.setItem("erp_access_token", accessToken);
  localStorage.setItem("erp_refresh_token", refreshToken2);
  localStorage.setItem("erp_user", JSON.stringify(user));
  return response.data;
}
const illustration = "/assets/login-illustration-DtgHAjRY.jpg";
function LoginPage() {
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      toast.success("Connexion réussie", {
        description: "Bienvenue sur AC ERP."
      });
      navigate({
        to: "/"
      });
    } catch (error) {
      toast.error("Connexion impossible", {
        description: error.message || "Verifier vos identifiants."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid min-h-screen lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative hidden overflow-hidden bg-gradient-primary lg:flex lg:flex-col lg:justify-between lg:p-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 44, height: 44, className: "h-11 w-11 rounded-xl bg-white/95 p-1.5" }),
        /* @__PURE__ */ jsx("span", { className: "font-display text-xl font-bold text-white", children: "AC ERP" })
      ] }),
      /* @__PURE__ */ jsx("img", { src: illustration, alt: "Illustration tableau de bord ERP", width: 1024, height: 1280, className: "absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-md", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold leading-tight text-white", children: "Pilotez votre entreprise avec intelligence." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-white/80", children: "Ventes, achats, stocks et finances réunis dans une plateforme moderne enrichie par l'IA." }),
        /* @__PURE__ */ jsx("ul", { className: "mt-8 space-y-3 text-sm text-white/90", children: [{
          icon: BarChart3,
          t: "Tableaux de bord décisionnels en temps réel"
        }, {
          icon: Zap,
          t: "Prévisions de ventes et de stock par IA"
        }, {
          icon: ShieldCheck,
          t: "Gestion fine des rôles et permissions"
        }].map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-white/15", children: /* @__PURE__ */ jsx(f.icon, { className: "h-4 w-4" }) }),
          f.t
        ] }, f.t)) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "relative z-10 text-xs text-white/60", children: "© 2026 AC ERP — Tous droits réservés." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center bg-background px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-3 lg:hidden", children: [
        /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 40, height: 40, className: "h-10 w-10" }),
        /* @__PURE__ */ jsx("span", { className: "font-display text-lg font-bold", children: "AC ERP" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Connexion" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Accédez à votre espace de gestion." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Adresse e-mail" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { id: "email", name: "email", type: "email", defaultValue: "s.martin@acerp.fr", className: "h-11 pl-9", required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Mot de passe" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { id: "password", name: "password", type: show ? "text" : "password", defaultValue: "motdepasse", className: "h-11 px-9", required: true }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow((s) => !s), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": show ? "Masquer" : "Afficher", children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Checkbox, { defaultChecked: true }),
            " Se souvenir de moi"
          ] }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "text-sm font-medium text-primary hover:underline", children: "Mot de passe oublié ?" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "h-11 w-full text-base", disabled: isSubmitting, children: isSubmitting ? "Connexion..." : "Se connecter" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Pas encore de compte ?",
        " ",
        /* @__PURE__ */ jsx("a", { href: "#", className: "font-medium text-primary hover:underline", children: "Contactez votre administrateur" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-xs text-muted-foreground", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:underline", children: "Accéder à la démo →" }) })
    ] }) })
  ] });
}
export {
  LoginPage as component
};
