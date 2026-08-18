import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Plus, Pin, Bot, MoreHorizontal, Pencil, PinOff, Archive, Trash2, User, LoaderCircle, Send } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { A as AppModal } from "./AppModal-DFgRRIth.js";
import { B as Button, I as Input } from "./input-CtRqKLv_.js";
import { c as cn, e as getStoredUser } from "./router-CU8xXL5-.js";
import { a as getConversations, b as getConversationMessages, s as sendChat, r as renameConversation, d as deleteConversation } from "./ia.service-Cnf4dgtz.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { toast } from "sonner";
import { r as resolveAvatarUrl } from "./avatar-Abbf1WZy.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-B-Xy56V-.js";
import { S as Skeleton } from "./skeleton-BsPIQX8r.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-284AmCSC.js";
import "@tanstack/react-router";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
import "@radix-ui/react-avatar";
import "@radix-ui/react-dropdown-menu";
const CONVERSATION_PREFERENCES_KEY = "erp_ia_conversation_preferences";
const suggestions = ["Quel est le chiffre d'affaires de ce mois ?", "Quels produits risquent une rupture de stock ?", "Génère un résumé des ventes du trimestre", "Quels clients ont des factures impayées ?"];
function welcomeMessage(firstName) {
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  return `${greeting} je suis l'assistant AC ERP. Je peux vous aider à analyser vos ventes, vos stocks, vos clients et vos finances.`;
}
function readConversationPreferences() {
  try {
    const raw = localStorage.getItem(CONVERSATION_PREFERENCES_KEY);
    if (!raw) return {
      pinnedIds: [],
      archivedIds: []
    };
    const parsed = JSON.parse(raw);
    return {
      pinnedIds: Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : [],
      archivedIds: Array.isArray(parsed.archivedIds) ? parsed.archivedIds : []
    };
  } catch {
    return {
      pinnedIds: [],
      archivedIds: []
    };
  }
}
function AssistantPage() {
  const [messages, setMessages] = useState([{
    role: "ai",
    text: welcomeMessage()
  }]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [idConversation, setIdConversation] = useState();
  const [sending, setSending] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    pinnedIds: [],
    archivedIds: []
  });
  const [conversationToRename, setConversationToRename] = useState();
  const [conversationToDelete, setConversationToDelete] = useState();
  const [renameTitle, setRenameTitle] = useState("");
  const [conversationActionPending, setConversationActionPending] = useState(false);
  const endRef = useRef(null);
  const hasLoadedConversations = useRef(false);
  const loadConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data);
    } catch {
      toast.error("Impossible de charger l'historique des conversations");
    } finally {
      setConversationsLoading(false);
    }
  };
  const persistPreferences = (nextPreferences) => {
    setPreferences(nextPreferences);
    localStorage.setItem(CONVERSATION_PREFERENCES_KEY, JSON.stringify(nextPreferences));
  };
  const startNewConversation = () => {
    setIdConversation(void 0);
    setMessages([{
      role: "ai",
      text: welcomeMessage(user?.prenom)
    }]);
  };
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    setPreferences(readConversationPreferences());
    window.addEventListener("auth-change", syncUser);
    window.addEventListener("erp:user-updated", syncUser);
    return () => {
      window.removeEventListener("auth-change", syncUser);
      window.removeEventListener("erp:user-updated", syncUser);
    };
  }, []);
  useEffect(() => {
    if (idConversation) return;
    const greeting = welcomeMessage(user?.prenom);
    setMessages((current) => {
      if (current.length !== 1 || current[0].role !== "ai" || current[0].text === greeting) {
        return current;
      }
      return [{
        role: "ai",
        text: greeting
      }];
    });
  }, [idConversation, user?.prenom]);
  useEffect(() => {
    if (hasLoadedConversations.current) return;
    hasLoadedConversations.current = true;
    void loadConversations();
  }, []);
  const send = async (text) => {
    if (!text.trim() || sending) return;
    setMessages((m) => [...m, {
      role: "user",
      text
    }]);
    setInput("");
    setSending(true);
    try {
      const response = await sendChat(text, idConversation);
      setIdConversation(response.data.idConversation);
      setMessages((m) => [...m, {
        role: "ai",
        text: response.data.reponse
      }]);
      await loadConversations();
    } catch (error) {
      const message = typeof error === "object" && error && "message" in error ? String(error.message) : "Le service IA est temporairement indisponible";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };
  const openConversation = async (conversation) => {
    try {
      const response = await getConversationMessages(conversation.id);
      setIdConversation(conversation.id);
      setMessages(response.data.map((message) => ({
        role: message.role === "assistant" ? "ai" : "user",
        text: message.contenu
      })));
    } catch {
      toast.error("Impossible de charger cette conversation");
    }
  };
  const togglePinned = (conversationId) => {
    const pinnedIds = preferences.pinnedIds.includes(conversationId) ? preferences.pinnedIds.filter((id) => id !== conversationId) : [...preferences.pinnedIds, conversationId];
    persistPreferences({
      ...preferences,
      pinnedIds
    });
  };
  const archiveConversation = (conversationId) => {
    const archivedIds = preferences.archivedIds.includes(conversationId) ? preferences.archivedIds.filter((id) => id !== conversationId) : [...preferences.archivedIds, conversationId];
    persistPreferences({
      ...preferences,
      archivedIds
    });
    if (idConversation === conversationId) startNewConversation();
  };
  const openRenameModal = (conversation) => {
    setConversationToRename(conversation);
    setRenameTitle(conversation.titre || "");
  };
  const confirmRename = async () => {
    if (!conversationToRename || !renameTitle.trim()) return;
    setConversationActionPending(true);
    try {
      const response = await renameConversation(conversationToRename.id, renameTitle.trim());
      setConversations((current) => current.map((item) => item.id === conversationToRename.id ? response.data : item));
      setConversationToRename(void 0);
      toast.success("Conversation renommée");
    } catch {
      toast.error("Impossible de renommer la conversation");
    } finally {
      setConversationActionPending(false);
    }
  };
  const confirmDelete = async () => {
    if (!conversationToDelete) return;
    setConversationActionPending(true);
    try {
      await deleteConversation(conversationToDelete.id);
      setConversations((current) => current.filter((item) => item.id !== conversationToDelete.id));
      persistPreferences({
        pinnedIds: preferences.pinnedIds.filter((id) => id !== conversationToDelete.id),
        archivedIds: preferences.archivedIds.filter((id) => id !== conversationToDelete.id)
      });
      if (idConversation === conversationToDelete.id) startNewConversation();
      setConversationToDelete(void 0);
      toast.success("Conversation supprimée");
    } catch {
      toast.error("Impossible de supprimer la conversation");
    } finally {
      setConversationActionPending(false);
    }
  };
  const visibleConversations = conversations.filter((conversation) => !preferences.archivedIds.includes(conversation.id)).sort((left, right) => {
    const leftPinned = preferences.pinnedIds.includes(left.id);
    const rightPinned = preferences.pinnedIds.includes(right.id);
    return Number(rightPinned) - Number(leftPinned);
  });
  const archivedConversations = conversations.filter((conversation) => preferences.archivedIds.includes(conversation.id));
  const avatarUrl = resolveAvatarUrl(user?.avatar);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Assistant conversationnel ERP", description: "Interrogez vos données en langage naturel", breadcrumb: ["Intelligence", "Assistant ERP"] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:h-[calc(100dvh-12.5rem)] lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden min-h-0 lg:block", children: /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto rounded-sm border border-border bg-card p-3 shadow-card", children: [
        /* @__PURE__ */ jsxs(Button, { className: "w-full gap-1.5", onClick: startNewConversation, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Nouvelle conversation"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Historique" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1", children: [
          conversationsLoading && Array.from({
            length: 3
          }, (_, index) => /* @__PURE__ */ jsx("li", { className: "px-2 py-2", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" }) }, index)),
          visibleConversations.map((conversation) => {
            const pinned = preferences.pinnedIds.includes(conversation.id);
            return /* @__PURE__ */ jsxs("li", { className: cn("group flex items-center gap-1 rounded-lg border border-transparent pr-1 transition-colors hover:bg-secondary/70", idConversation === conversation.id && "border-primary/20 bg-primary/5"), children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => void openConversation(conversation), className: "flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm text-muted-foreground hover:text-foreground", children: [
                pinned ? /* @__PURE__ */ jsx(Pin, { className: "h-3.5 w-3.5 shrink-0 text-primary" }) : /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: conversation.titre || "Nouvelle conversation" })
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100", "aria-label": "Actions de la conversation", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onSelect: () => openRenameModal(conversation), children: [
                    /* @__PURE__ */ jsx(Pencil, {}),
                    " Renommer"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onSelect: () => togglePinned(conversation.id), children: [
                    pinned ? /* @__PURE__ */ jsx(PinOff, {}) : /* @__PURE__ */ jsx(Pin, {}),
                    pinned ? "Désépingler" : "Épingler"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onSelect: () => archiveConversation(conversation.id), children: [
                    /* @__PURE__ */ jsx(Archive, {}),
                    " Archiver"
                  ] }),
                  /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onSelect: () => setConversationToDelete(conversation), children: [
                    /* @__PURE__ */ jsx(Trash2, {}),
                    " Supprimer"
                  ] })
                ] })
              ] })
            ] }, conversation.id);
          }),
          !conversationsLoading && visibleConversations.length === 0 && /* @__PURE__ */ jsx("li", { className: "px-2 py-4 text-center text-xs text-muted-foreground", children: "Aucune conversation active" })
        ] }),
        !conversationsLoading && archivedConversations.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t border-border pt-3", children: [
          /* @__PURE__ */ jsx("p", { className: "px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Archivées" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1", children: archivedConversations.map((conversation) => /* @__PURE__ */ jsxs("li", { className: "group flex items-center gap-1 rounded-lg border border-dashed border-border/80 pr-1", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => void openConversation(conversation), className: "flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Archive, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: conversation.titre || "Nouvelle conversation" })
            ] }),
            /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100", "aria-label": "Actions de la conversation archivée", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onSelect: () => archiveConversation(conversation.id), children: [
                  /* @__PURE__ */ jsx(Archive, {}),
                  " Restaurer"
                ] }),
                /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onSelect: () => setConversationToDelete(conversation), children: [
                  /* @__PURE__ */ jsx(Trash2, {}),
                  " Supprimer"
                ] })
              ] })
            ] })
          ] }, conversation.id)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "h-[68vh] min-h-0 lg:col-span-3 lg:h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col rounded-sm border border-border bg-card shadow-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 space-y-5 overflow-y-auto p-5", children: [
          messages.map((m, i) => /* @__PURE__ */ jsxs("div", { className: cn("flex animate-in fade-in-0 slide-in-from-bottom-2 gap-3 duration-300", m.role === "user" && "flex-row-reverse"), children: [
            m.role === "ai" ? /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 shrink-0 border border-primary/15", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: avatarUrl || void 0, alt: "Votre profil" }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: cn("max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"), children: m.text })
          ] }, i)),
          sending && /* @__PURE__ */ jsxs("div", { className: "flex animate-in fade-in-0 slide-in-from-bottom-2 gap-3 duration-300", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1", "aria-label": "Réponse en cours", children: [0, 1, 2].map((index) => /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-primary", style: {
                animationDelay: `${index * 150}ms`
              } }, index)) }),
              "Analyse en cours"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { ref: endRef })
        ] }),
        messages.length <= 1 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 px-5 pb-3", children: suggestions.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => void send(s), disabled: sending, className: "rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5", children: s }, s)) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          void send(input);
        }, className: "flex items-center gap-2 border-t border-border p-3", children: [
          /* @__PURE__ */ jsx("img", { src: logo, alt: "", width: 28, height: 28, className: "h-7 w-7 shrink-0" }),
          /* @__PURE__ */ jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Posez votre question…", className: "h-10 flex-1" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", size: "icon", className: "h-10 w-10 shrink-0", disabled: !input.trim() || sending, children: sending ? /* @__PURE__ */ jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: Boolean(conversationToRename), onOpenChange: (open) => {
      if (!open && !conversationActionPending) {
        setConversationToRename(void 0);
      }
    }, title: "Renommer la conversation", description: "Choisissez un titre clair pour retrouver cet échange rapidement.", size: "sm", closeOnOutsideClick: true, footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setConversationToRename(void 0), disabled: conversationActionPending, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void confirmRename(), disabled: !renameTitle.trim() || conversationActionPending, children: [
        conversationActionPending ? /* @__PURE__ */ jsx(LoaderCircle, { className: "animate-spin" }) : null,
        "Enregistrer"
      ] })
    ] }), children: /* @__PURE__ */ jsx(Input, { autoFocus: true, value: renameTitle, onChange: (event) => setRenameTitle(event.target.value), placeholder: "Titre de la conversation", onKeyDown: (event) => {
      if (event.key === "Enter") void confirmRename();
    } }) }),
    /* @__PURE__ */ jsx(AppModal, { open: Boolean(conversationToDelete), onOpenChange: (open) => {
      if (!open && !conversationActionPending) {
        setConversationToDelete(void 0);
      }
    }, title: "Supprimer la conversation", description: "Cette action est définitive. Tous les messages associés seront supprimés.", size: "sm", closeOnOutsideClick: true, footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setConversationToDelete(void 0), disabled: conversationActionPending, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void confirmDelete(), disabled: conversationActionPending, children: [
        conversationActionPending ? /* @__PURE__ */ jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsx(Trash2, {}),
        "Supprimer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Conversation concernée :",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: conversationToDelete?.titre || "Nouvelle conversation" })
    ] }) })
  ] });
}
export {
  AssistantPage as component
};
