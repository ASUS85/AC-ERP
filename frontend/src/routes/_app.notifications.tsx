import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileWarning,
  Sparkles,
  CheckCircle2,
  CheckCheck,
  LoaderCircle,
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
    wrap: "bg-destructive/10 text-destructive",
    icon: <FileWarning className="h-4 w-4" />,
  },
  warning: {
    wrap: "bg-warning/15 text-warning-foreground",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  info: {
    wrap: "bg-info/12 text-info",
    icon: <Sparkles className="h-4 w-4" />,
  },
  success: {
    wrap: "bg-success/12 text-success",
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

const localDateValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

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
            className="gap-1.5"
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
          <TabsList>
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
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filtrer les notifications par date"
            />
          </label>
        </div>
      </Tabs>
      <SectionCard
        title="Activité"
        description={`${visibleItems.length} notification${visibleItems.length > 1 ? "s" : ""}${selectedDate ? " pour cette date" : ""}`}
      >
        <div className="space-y-2">
          {loading && (
            <div className="flex justify-center py-8">
              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && visibleItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <img
                src="/src/assets/sorry.svg"
                alt="Aucun élément"
                className="mb-3 w-28 opacity-90"
              />
              <p className="mt-1 text-xs text-muted-foreground/70">
                {selectedDate
                  ? "Aucune notification pour cette date."
                  : "Aucune notification disponible."}
              </p>
            </div>
          )}
          {!loading &&
            visibleItems.map((n) => {
              const s = notificationStyle(n.typeNotif);
              const expanded = expandedIds.has(n.id);
              return (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => toggleNotification(n)}
                  aria-expanded={expanded}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-all hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    n.isLue
                      ? "border-border"
                      : "border-primary/20 bg-primary/[0.03]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      s.wrap,
                    )}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {n.titre}
                      </p>
                      {!n.isLue && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "whitespace-pre-wrap break-words text-sm text-muted-foreground",
                        !expanded && "line-clamp-2",
                      )}
                    >
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </SectionCard>
    </>
  );
}
