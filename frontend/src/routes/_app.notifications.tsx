import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, FileWarning, Sparkles, CheckCircle2, ShoppingCart, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications } from "@/lib/erp-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — AC ERP" }] }),
  component: NotificationsPage,
});

const styles: Record<string, { wrap: string; icon: React.ReactNode }> = {
  destructive: { wrap: "bg-destructive/10 text-destructive", icon: <FileWarning className="h-4 w-4" /> },
  warning: { wrap: "bg-warning/15 text-warning-foreground", icon: <AlertTriangle className="h-4 w-4" /> },
  info: { wrap: "bg-info/12 text-info", icon: <Sparkles className="h-4 w-4" /> },
  success: { wrap: "bg-success/12 text-success", icon: <CheckCircle2 className="h-4 w-4" /> },
};

function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Centre de notifications"
        description="Alertes ERP et intelligence artificielle en temps réel"
        breadcrumb={["Administration", "Notifications"]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Toutes les notifications marquées comme lues")}>
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </Button>
        }
      />
      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread">Non lues</TabsTrigger>
          <TabsTrigger value="ai">Alertes IA</TabsTrigger>
        </TabsList>
      </Tabs>
      <SectionCard title="Activité" description="6 notifications récentes">
        <div className="space-y-2">
          {notifications.map((n) => {
            const s = styles[n.type];
            return (
              <div
                key={n.titre + n.temps}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3.5 transition-colors hover:bg-secondary/40",
                  n.lu ? "border-border" : "border-primary/20 bg-primary/[0.03]",
                )}
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", s.wrap)}>{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.titre}</p>
                    {!n.lu && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.texte}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{n.temps}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </>
  );
}