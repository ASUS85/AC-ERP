import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileWarning,
  Sparkles,
  CheckCircle2,
  CheckCheck,
  LoaderCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getNotifications,
  marquerLue,
  marquerToutesLues,
} from "@/lib/api/notifications.service";
import type { Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — AC ERP" }] }),
  component: NotificationsPage,
});

const styles: Record<string, { wrap: string; icon: React.ReactNode }> = {
  destructive: {
    wrap: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <FileWarning className="h-4 w-4" />,
  },
  warning: {
    wrap: "bg-warning/15 text-warning-foreground border-warning/20",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  info: {
    wrap: "bg-info/12 text-info border-info/20",
    icon: <Sparkles className="h-4 w-4" />,
  },
  success: {
    wrap: "bg-success/12 text-success border-success/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

type TabValue = "all" | "unread" | "ai";

const notificationStyle = (type: string) => {
  if (type === "FACTURE_ECHEANCE" || type === "DEVIS_EXPIRE")
    return styles.destructive;
  if (type === "ALERTE_STOCK" || type === "SECURITE") return styles.warning;
  if (type === "PAIEMENT_RECU" || type === "RAPPORT_PRET")
    return styles.success;
  return styles.info;
};

const isAiNotification = (notification: Notification) =>
  notification.typeNotif === "RAPPORT_PRET" ||
  notification.entityType?.toLowerCase().includes("ia") ||
  /\b(ia|intelligence artificielle|prévision)\b/i.test(
    `${notification.titre} ${notification.message}`,
  );

const dateBounds = (value: string) => {
  const start = new Date(`${value}T00:00:00`);
  const end = new Date(`${value}T23:59:59.999`);
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
};

const relativeTime = (value: string) => {
  const elapsed = Date.now() - new Date(value).getTime();
  const formatter = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  for (const [unit, size] of units) {
    if (elapsed >= size)
      return formatter.format(-Math.floor(elapsed / size), unit);
  }
  return "à l'instant";
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return { time: "", date: "" };

  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return { time, date: formattedDate };
};

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [tab, setTab] = useState<TabValue>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = selectedDate ? dateBounds(selectedDate) : undefined;
    getNotifications(params)
      .then((response: any) => {
        if (active) setItems(response.data || []);
      })
      .catch(() => toast.error("Impossible de charger les notifications"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (tab === "unread") return !item.isLue;
        if (tab === "ai") return isAiNotification(item);
        return true;
      }),
    [items, tab],
  );

  const toggleNotification = async (notification: Notification) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      next.has(notification.id)
        ? next.delete(notification.id)
        : next.add(notification.id);
      return next;
    });
    if (!notification.isLue) {
      try {
        await marquerLue(notification.id);
        setItems((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, isLue: true } : item,
          ),
        );
      } catch {
        toast.error("La notification n'a pas pu être marquée comme lue");
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await marquerToutesLues();
      setItems((current) => current.map((item) => ({ ...item, isLue: true })));
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch {
      toast.error("Impossible de marquer les notifications comme lues");
    }
  };

  return (
    <>
      <PageHeader
        title="Centre de notifications"
        description="Alertes ERP et intelligence artificielle en temps réel"
        breadcrumb={["Administration", "Notifications"]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground/90 transition-all"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </Button>
        }
      />
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabValue)}
        className="mb-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">Non lues</TabsTrigger>
            <TabsTrigger value="ai">Alertes IA</TabsTrigger>
          </TabsList>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              aria-label="Filtrer les notifications par date"
            />
          </label>
        </div>
      </Tabs>

      <SectionCard
        title="Activité"
        description={`${visibleItems.length} notification${visibleItems.length > 1 ? "s" : ""}${selectedDate ? " pour cette date" : ""}`}
        headerGradient
      >
        <div className="space-y-2.5">
          {loading && (
            <div className="flex justify-center py-10">
              <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && visibleItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <img
                src="/src/assets/sorry.svg"
                alt="Aucun élément"
                className="mb-3 w-28 opacity-80"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedDate
                  ? "Aucune notification pour cette date."
                  : "Aucune notification disponible."}
              </p>
            </div>
          )}

          {!loading &&
            visibleItems.map((n, index) => {
              // 1. On récupère "index" ici
              const s = notificationStyle(n.typeNotif);
              const expanded = expandedIds.has(n.id);
              const { time, date } = formatDateTime(n.createdAt);
              const isEven = index % 2 === 0; // 2. On vérifie si l'index est pair

              return (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => toggleNotification(n)}
                  aria-expanded={expanded}
                  className={cn(
                    "relative group flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

                    // Notifications non lues
                    !n.isLue &&
                      "border-primary/25 bg-primary/10 shadow-xs hover:bg-primary/15",

                    // Notifications lues : Alternance 1 sur 2
                    n.isLue &&
                      isEven &&
                      "border-border/60 bg-primary/5 hover:bg-primary/10",
                    n.isLue &&
                      !isEven &&
                      "border-border/60 bg-card/50 hover:bg-accent/40",
                  )}
                >
                  {/* Indicateur visuel d'état non-lu */}
                  {!n.isLue && (
                    <span className="absolute top-4 left-2.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10" />
                  )}

                  {/* Icône de type */}
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-transform group-hover:scale-105",
                      s.wrap,
                    )}
                  >
                    {s.icon}
                  </span>

                  {/* Contenu principal */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm tracking-tight text-foreground",
                          n.isLue ? "font-medium" : "font-semibold",
                        )}
                      >
                        {n.titre}
                      </p>
                    </div>

                    <p
                      className={cn(
                        "whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground/90 transition-all",
                        !expanded && "line-clamp-2",
                      )}
                    >
                      {n.message}
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-medium text-muted-foreground/70">
                      <span>{relativeTime(n.createdAt)}</span>
                    </div>
                  </div>

                  {/* Horodatage à l'extrême droite */}
                  <div className="shrink-0 self-start text-right pl-2">
                    <div className="inline-flex flex-col items-end gap-0.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </SectionCard>
    </>
  );
}
