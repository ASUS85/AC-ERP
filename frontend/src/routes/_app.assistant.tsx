import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Send, Bot, User, Plus, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import logo from "@/assets/erp-logo.png";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({ meta: [{ title: "Assistant ERP — AC ERP" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "ai"; text: string };

const suggestions = [
  "Quel est le chiffre d'affaires de ce mois ?",
  "Quels produits risquent une rupture de stock ?",
  "Génère un résumé des ventes du trimestre",
  "Quels clients ont des factures impayées ?",
];

const history = ["Analyse des ventes Q2", "Prévision de trésorerie", "Top clients 2026", "Optimisation des stocks"];

function aiReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("chiffre") || t.includes("ca")) return "Le chiffre d'affaires de juin 2026 s'élève à **284 750 f**, en hausse de **+12,4 %** par rapport au mois précédent. Les ventes d'informatique représentent 58 % du total.";
  if (t.includes("rupture") || t.includes("stock")) return "4 produits sont à risque : « Routeur Wi-Fi 6 » (rupture immédiate), « Écran 27\" 4K » (~8 jours), « Clavier mécanique RGB » (~14 jours). Je recommande un réapprovisionnement prioritaire.";
  if (t.includes("impayée") || t.includes("facture")) return "5 factures sont impayées pour un total de **18 420 f**. La plus en retard est FAC-2026-146 (InfoCorp, 980 f), échue depuis le 1er juin.";
  return "D'après les données de l'ERP, voici une synthèse : les performances commerciales sont en croissance ce trimestre (+9 %), avec une bonne maîtrise des achats. Souhaitez-vous un rapport détaillé ?";
}

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Bonjour Sophie 👋 Je suis l'assistant AC ERP. Posez-moi une question sur vos ventes, stocks, clients ou finances." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => setMessages((m) => [...m, { role: "ai", text: aiReply(text) }]), 500);
  };

  return (
    <>
      <PageHeader title="Assistant conversationnel ERP" description="Interrogez vos données en langage naturel" breadcrumb={["Intelligence", "Assistant ERP"]} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-border bg-card p-3 shadow-card">
            <Button className="w-full gap-1.5" onClick={() => setMessages(messages.slice(0, 1))}>
              <Plus className="h-4 w-4" /> Nouvelle conversation
            </Button>
            <p className="mt-4 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historique</p>
            <ul className="mt-2 space-y-0.5">
              {history.map((h) => (
                <li key={h}>
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{h}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex h-[68vh] flex-col rounded-xl border border-border bg-card shadow-card">
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", m.role === "ai" ? "bg-primary/10 text-primary" : "bg-gradient-primary text-white")}>
                    {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </span>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground")}>
                    {m.text.split("**").map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <img src={logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Posez votre question…" className="h-10 flex-1" />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}