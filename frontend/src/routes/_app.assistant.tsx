import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import {
  Archive,
  Bot,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  deleteConversation,
  getConversationMessages,
  getConversations,
  renameConversation,
  sendChat,
  type IaConversation,
} from "@/lib/api/ia.service";
import logo from "@/assets/erp-logo.png";
import { toast } from "sonner";
import { getStoredUser, type AuthUserLike } from "@/lib/auth-session";
import { resolveAvatarUrl } from "@/lib/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({ meta: [{ title: "Assistant ERP — AC ERP" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "ai"; text: string };
type ConversationPreferences = { pinnedIds: string[]; archivedIds: string[] };

const CONVERSATION_PREFERENCES_KEY = "erp_ia_conversation_preferences";

const suggestions = [
  "Quel est le chiffre d'affaires de ce mois ?",
  "Quels produits risquent une rupture de stock ?",
  "Génère un résumé des ventes du trimestre",
  "Quels clients ont des factures impayées ?",
];

function welcomeMessage(firstName?: string) {
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  return `${greeting} je suis l'assistant AC ERP. Je peux vous aider à analyser vos ventes, vos stocks, vos clients et vos finances.`;
}

function readConversationPreferences(): ConversationPreferences {
  try {
    const raw = localStorage.getItem(CONVERSATION_PREFERENCES_KEY);
    if (!raw) return { pinnedIds: [], archivedIds: [] };
    const parsed = JSON.parse(raw) as Partial<ConversationPreferences>;
    return {
      pinnedIds: Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : [],
      archivedIds: Array.isArray(parsed.archivedIds) ? parsed.archivedIds : [],
    };
  } catch {
    return { pinnedIds: [], archivedIds: [] };
  }
}

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: welcomeMessage(),
    },
  ]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<IaConversation[]>([]);
  const [idConversation, setIdConversation] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [user, setUser] = useState<AuthUserLike | null>(null);
  const [preferences, setPreferences] = useState<ConversationPreferences>({
    pinnedIds: [],
    archivedIds: [],
  });
  const [conversationToRename, setConversationToRename] =
    useState<IaConversation>();
  const [conversationToDelete, setConversationToDelete] =
    useState<IaConversation>();
  const [renameTitle, setRenameTitle] = useState("");
  const [conversationActionPending, setConversationActionPending] =
    useState(false);
  const endRef = useRef<HTMLDivElement>(null);
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

  const persistPreferences = (nextPreferences: ConversationPreferences) => {
    setPreferences(nextPreferences);
    localStorage.setItem(
      CONVERSATION_PREFERENCES_KEY,
      JSON.stringify(nextPreferences),
    );
  };

  const startNewConversation = () => {
    setIdConversation(undefined);
    setMessages([{ role: "ai", text: welcomeMessage(user?.prenom) }]);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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
      if (
        current.length !== 1 ||
        current[0].role !== "ai" ||
        current[0].text === greeting
      ) {
        return current;
      }
      return [{ role: "ai", text: greeting }];
    });
  }, [idConversation, user?.prenom]);

  useEffect(() => {
    if (hasLoadedConversations.current) return;
    hasLoadedConversations.current = true;
    void loadConversations();
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const response = await sendChat(text, idConversation);
      setIdConversation(response.data.idConversation);
      setMessages((m) => [...m, { role: "ai", text: response.data.reponse }]);
      await loadConversations();
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String(error.message)
          : "Le service IA est temporairement indisponible";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const openConversation = async (conversation: IaConversation) => {
    try {
      const response = await getConversationMessages(conversation.id);
      setIdConversation(conversation.id);
      setMessages(
        response.data.map((message) => ({
          role: message.role === "assistant" ? "ai" : "user",
          text: message.contenu,
        })),
      );
    } catch {
      toast.error("Impossible de charger cette conversation");
    }
  };

  const togglePinned = (conversationId: string) => {
    const pinnedIds = preferences.pinnedIds.includes(conversationId)
      ? preferences.pinnedIds.filter((id) => id !== conversationId)
      : [...preferences.pinnedIds, conversationId];
    persistPreferences({ ...preferences, pinnedIds });
  };

  const archiveConversation = (conversationId: string) => {
    const archivedIds = preferences.archivedIds.includes(conversationId)
      ? preferences.archivedIds.filter((id) => id !== conversationId)
      : [...preferences.archivedIds, conversationId];
    persistPreferences({ ...preferences, archivedIds });
    if (idConversation === conversationId) startNewConversation();
  };

  const openRenameModal = (conversation: IaConversation) => {
    setConversationToRename(conversation);
    setRenameTitle(conversation.titre || "");
  };

  const confirmRename = async () => {
    if (!conversationToRename || !renameTitle.trim()) return;
    setConversationActionPending(true);
    try {
      const response = await renameConversation(
        conversationToRename.id,
        renameTitle.trim(),
      );
      setConversations((current) =>
        current.map((item) =>
          item.id === conversationToRename.id ? response.data : item,
        ),
      );
      setConversationToRename(undefined);
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
      setConversations((current) =>
        current.filter((item) => item.id !== conversationToDelete.id),
      );
      persistPreferences({
        pinnedIds: preferences.pinnedIds.filter(
          (id) => id !== conversationToDelete.id,
        ),
        archivedIds: preferences.archivedIds.filter(
          (id) => id !== conversationToDelete.id,
        ),
      });
      if (idConversation === conversationToDelete.id) startNewConversation();
      setConversationToDelete(undefined);
      toast.success("Conversation supprimée");
    } catch {
      toast.error("Impossible de supprimer la conversation");
    } finally {
      setConversationActionPending(false);
    }
  };

  const visibleConversations = conversations
    .filter(
      (conversation) => !preferences.archivedIds.includes(conversation.id),
    )
    .sort((left, right) => {
      const leftPinned = preferences.pinnedIds.includes(left.id);
      const rightPinned = preferences.pinnedIds.includes(right.id);
      return Number(rightPinned) - Number(leftPinned);
    });
  const archivedConversations = conversations.filter((conversation) =>
    preferences.archivedIds.includes(conversation.id),
  );
  const avatarUrl = resolveAvatarUrl(user?.avatar);

  return (
    <>
      <PageHeader
        title="Assistant conversationnel ERP"
        description="Interrogez vos données en langage naturel"
        breadcrumb={["Intelligence", "Assistant ERP"]}
      />
      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-12.5rem)] lg:grid-cols-4">
        <aside className="hidden min-h-0 lg:block">
          <div className="h-full overflow-y-auto rounded-sm border border-border bg-card p-3 shadow-card">
            <Button className="w-full gap-1.5" onClick={startNewConversation}>
              <Plus className="h-4 w-4" /> Nouvelle conversation
            </Button>
            <p className="mt-4 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Historique
            </p>
            <ul className="mt-2 space-y-1">
              {conversationsLoading &&
                Array.from({ length: 3 }, (_, index) => (
                  <li key={index} className="px-2 py-2">
                    <Skeleton className="h-8 w-full" />
                  </li>
                ))}
              {visibleConversations.map((conversation) => {
                const pinned = preferences.pinnedIds.includes(conversation.id);
                return (
                  <li
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-lg border border-transparent pr-1 transition-colors hover:bg-secondary/70",
                      idConversation === conversation.id &&
                        "border-primary/20 bg-primary/5",
                    )}
                  >
                    <button
                      onClick={() => void openConversation(conversation)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm text-muted-foreground hover:text-foreground"
                    >
                      {pinned ? (
                        <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <Bot className="h-4 w-4 shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {conversation.titre || "Nouvelle conversation"}
                      </span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                          aria-label="Actions de la conversation"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={() => openRenameModal(conversation)}
                        >
                          <Pencil /> Renommer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => togglePinned(conversation.id)}
                        >
                          {pinned ? <PinOff /> : <Pin />}
                          {pinned ? "Désépingler" : "Épingler"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => archiveConversation(conversation.id)}
                        >
                          <Archive /> Archiver
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setConversationToDelete(conversation)}
                        >
                          <Trash2 /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
              {!conversationsLoading && visibleConversations.length === 0 && (
                <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Aucune conversation active
                </li>
              )}
            </ul>
            {!conversationsLoading && archivedConversations.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Archivées
                </p>
                <ul className="mt-2 space-y-1">
                  {archivedConversations.map((conversation) => (
                    <li
                      key={conversation.id}
                      className="group flex items-center gap-1 rounded-lg border border-dashed border-border/80 pr-1"
                    >
                      <button
                        onClick={() => void openConversation(conversation)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm text-muted-foreground"
                      >
                        <Archive className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          {conversation.titre || "Nouvelle conversation"}
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                            aria-label="Actions de la conversation archivée"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onSelect={() =>
                              archiveConversation(conversation.id)
                            }
                          >
                            <Archive /> Restaurer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() =>
                              setConversationToDelete(conversation)
                            }
                          >
                            <Trash2 /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <div className="h-[68vh] min-h-0 lg:col-span-3 lg:h-full">
          <div className="flex h-full flex-col rounded-sm border border-border bg-card shadow-card">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex animate-in fade-in-0 slide-in-from-bottom-2 gap-3 duration-300",
                    m.role === "user" && "flex-row-reverse",
                  )}
                >
                  {m.role === "ai" ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </span>
                  ) : (
                    <Avatar className="h-8 w-8 shrink-0 border border-primary/15">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt="Votre profil"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "ai"
                        ? "bg-secondary text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex animate-in fade-in-0 slide-in-from-bottom-2 gap-3 duration-300">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    <span
                      className="flex items-center gap-1"
                      aria-label="Réponse en cours"
                    >
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                          style={{ animationDelay: `${index * 150}ms` }}
                        />
                      ))}
                    </span>
                    Analyse en cours
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    disabled={sending}
                    className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <img
                src={logo}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0"
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question…"
                className="h-10 flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={!input.trim() || sending}
              >
                {sending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <AppModal
        open={Boolean(conversationToRename)}
        onOpenChange={(open) => {
          if (!open && !conversationActionPending) {
            setConversationToRename(undefined);
          }
        }}
        title="Renommer la conversation"
        description="Choisissez un titre clair pour retrouver cet échange rapidement."
        size="sm"
        closeOnOutsideClick
        footer={
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setConversationToRename(undefined)}
              disabled={conversationActionPending}
            >
              Annuler
            </Button>
            <Button
              onClick={() => void confirmRename()}
              disabled={!renameTitle.trim() || conversationActionPending}
            >
              {conversationActionPending ? (
                <LoaderCircle className="animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </div>
        }
      >
        <Input
          autoFocus
          value={renameTitle}
          onChange={(event) => setRenameTitle(event.target.value)}
          placeholder="Titre de la conversation"
          onKeyDown={(event) => {
            if (event.key === "Enter") void confirmRename();
          }}
        />
      </AppModal>
      <AppModal
        open={Boolean(conversationToDelete)}
        onOpenChange={(open) => {
          if (!open && !conversationActionPending) {
            setConversationToDelete(undefined);
          }
        }}
        title="Supprimer la conversation"
        description="Cette action est définitive. Tous les messages associés seront supprimés."
        size="sm"
        closeOnOutsideClick
        footer={
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setConversationToDelete(undefined)}
              disabled={conversationActionPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={conversationActionPending}
            >
              {conversationActionPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Trash2 />
              )}
              Supprimer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Conversation concernée :{" "}
          <span className="font-medium text-foreground">
            {conversationToDelete?.titre || "Nouvelle conversation"}
          </span>
        </p>
      </AppModal>
    </>
  );
}
