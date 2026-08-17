import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Eye } from "lucide-react";
import { B as Button, I as Input } from "./input-CXzFZCFy.js";
import { L as Label } from "./label-V8RA7mjz.js";
import { toast } from "sonner";
import { R as Route, r as resetPassword } from "./router-qTiJlct9.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { i as illustration } from "./login-illustration-Bw5LFH-i.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
function ResetPasswordPage() {
  const {
    token
  } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: ""
  });
  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {
      password: "",
      confirmPassword: ""
    };
    let hasError = false;
    if (!password.trim()) {
      newErrors.password = "Champ requis";
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      hasError = true;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Champ requis";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      hasError = true;
    }
    setErrors(newErrors);
    if (hasError) return;
    if (!token) {
      toast.error("Lien invalide", {
        description: "Demandez un nouveau lien de réinitialisation."
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success("Mot de passe modifié", {
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
      });
    } catch (error) {
      toast.error("Réinitialisation impossible", {
        description: error.message || "Le lien est invalide ou expiré."
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
        /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold leading-tight text-white", children: "Sécurisez votre accès AC ERP." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-white/80", children: "Choisissez un nouveau mot de passe robuste pour protéger vos données de gestion." })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "relative z-10 text-xs text-white/60", children: "© 2026 AC ERP — Tous droits réservés." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 lg:p-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-8 flex flex-col items-center gap-3", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 96, height: 96, className: "h-24 w-24" }) }),
      /* @__PURE__ */ jsxs(Link, { to: "/login", className: "mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Retour à la connexion"
      ] }),
      done ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Mot de passe modifié" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: "Votre mot de passe a été réinitialisé avec succès. Connectez-vous avec vos nouveaux identifiants." }),
        /* @__PURE__ */ jsx(Button, { className: "mt-8 h-11 w-full", onClick: () => navigate({
          to: "/login"
        }), children: "Se connecter" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Nouveau mot de passe" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Saisissez et confirmez votre nouveau mot de passe." }),
        !token && /* @__PURE__ */ jsx("p", { className: "mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600", children: "Lien de réinitialisation invalide. Retournez à la connexion pour demander un nouveau lien." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-8 space-y-4", children: [
          /* @__PURE__ */ jsx(PasswordField, { id: "password", label: "Nouveau mot de passe", value: password, show: showPassword, error: errors.password, onToggleShow: () => setShowPassword((value) => !value), onChange: (value) => {
            setPassword(value);
            if (errors.password) setErrors((prev) => ({
              ...prev,
              password: ""
            }));
          } }),
          /* @__PURE__ */ jsx(PasswordField, { id: "confirmPassword", label: "Confirmer le mot de passe", value: confirmPassword, show: showConfirmPassword, error: errors.confirmPassword, onToggleShow: () => setShowConfirmPassword((value) => !value), onChange: (value) => {
            setConfirmPassword(value);
            if (errors.confirmPassword) setErrors((prev) => ({
              ...prev,
              confirmPassword: ""
            }));
          } }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "h-11 w-full text-base", disabled: isSubmitting || !token, children: isSubmitting ? "Modification..." : "Modifier le mot de passe" })
        ] })
      ] })
    ] }) })
  ] });
}
function PasswordField({
  id,
  label,
  value,
  show,
  error,
  onToggleShow,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: id, children: label }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { id, type: show ? "text" : "password", placeholder: label, value, onChange: (e) => onChange(e.target.value), className: `h-11 px-9 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}` }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onToggleShow, className: "absolute right-3 top-[22px] -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": show ? "Masquer" : "Afficher", children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: error })
  ] });
}
export {
  ResetPasswordPage as component
};
