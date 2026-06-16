import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  breadcrumb = [],
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
          <Home className="h-3.5 w-3.5" />
          Accueil
        </Link>
        {breadcrumb.map((b) => (
          <span key={b} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground/80">{b}</span>
          </span>
        ))}
      </nav>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}