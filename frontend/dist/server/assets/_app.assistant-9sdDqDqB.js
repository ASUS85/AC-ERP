import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, Bot, User, Send } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { B as Button, I as Input } from "./input-Bxvgloed.js";
import { c as cn } from "./router-DKXtA4iJ.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "sonner";
const suggestions = ["Quel est le chiffre d'affaires de ce mois ?", "Quels produits risquent une rupture de stock ?", "Génère un résumé des ventes du trimestre", "Quels clients ont des factures impayées ?"];
const history = ["Analyse des ventes Q2", "Prévision de trésorerie", "Top clients 2026", "Optimisation des stocks"];
function aiReply(q) {
  const t = q.toLowerCase();
  if (t.includes("chiffre") || t.includes("ca")) return "Le chiffre d'affaires de juin 2026 s'élève à **284 750 f**, en hausse de **+12,4 %** par rapport au mois précédent. Les ventes d'informatique représentent 58 % du total.";
  if (t.includes("rupture") || t.includes("stock")) return '4 produits sont à risque : « Routeur Wi-Fi 6 » (rupture immédiate), « Écran 27" 4K » (~8 jours), « Clavier mécanique RGB » (~14 jours). Je recommande un réapprovisionnement prioritaire.';
  if (t.includes("impayée") || t.includes("facture")) return "5 factures sont impayées pour un total de **18 420 f**. La plus en retard est FAC-2026-146 (InfoCorp, 980 f), échue depuis le 1er juin.";
  return "D'après les données de l'ERP, voici une synthèse : les performances commerciales sont en croissance ce trimestre (+9 %), avec une bonne maîtrise des achats. Souhaitez-vous un rapport détaillé ?";
}
function AssistantPage() {
  const [messages, setMessages] = useState([{
    role: "ai",
    text: "Bonjour Sophie 👋 Je suis l'assistant AC ERP. Posez-moi une question sur vos ventes, stocks, clients ou finances."
  }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const send = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, {
      role: "user",
      text
    }]);
    setInput("");
    setTimeout(() => setMessages((m) => [...m, {
      role: "ai",
      text: aiReply(text)
    }]), 500);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Assistant conversationnel ERP", description: "Interrogez vos données en langage naturel", breadcrumb: ["Intelligence", "Assistant ERP"] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-3 shadow-card", children: [
        /* @__PURE__ */ jsxs(Button, { className: "w-full gap-1.5", onClick: () => setMessages(messages.slice(0, 1)), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Nouvelle conversation"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Historique" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-0.5", children: history.map((h) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { className: "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: h })
        ] }) }, h)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxs("div", { className: "flex h-[68vh] flex-col rounded-xl border border-border bg-card shadow-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-5 overflow-y-auto p-5", children: [
          messages.map((m, i) => /* @__PURE__ */ jsxs("div", { className: cn("flex gap-3", m.role === "user" && "flex-row-reverse"), children: [
            /* @__PURE__ */ jsx("span", { className: cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", m.role === "ai" ? "bg-primary/10 text-primary" : "bg-gradient-primary text-white"), children: m.role === "ai" ? /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("div", { className: cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"), children: m.text.split("**").map((part, j) => j % 2 === 1 ? /* @__PURE__ */ jsx("strong", { children: part }, j) : part) })
          ] }, i)),
          /* @__PURE__ */ jsx("div", { ref: endRef })
        ] }),
        messages.length <= 1 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 px-5 pb-3", children: suggestions.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => send(s), className: "rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5", children: s }, s)) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          send(input);
        }, className: "flex items-center gap-2 border-t border-border p-3", children: [
          /* @__PURE__ */ jsx("img", { src: logo, alt: "", width: 28, height: 28, className: "h-7 w-7 shrink-0" }),
          /* @__PURE__ */ jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Posez votre question…", className: "h-10 flex-1" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", size: "icon", className: "h-10 w-10 shrink-0", disabled: !input.trim(), children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AssistantPage as component
};
