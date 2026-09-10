import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "xxl";
type ModalPosition = "center" | "top" | "right";

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  position = "center",
  closeOnOutsideClick = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnOutsideClick?: boolean;
}) {
  const sizeClasses: Record<ModalSize, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
    xxl: "sm:max-w-6xl",
  };

  const positionClasses: Record<ModalPosition, string> = {
    center: "top-[50%] -translate-y-[50%]",
    top: "top-6 sm:top-8 translate-y-0",
    right: "top-6 sm:top-8 right-6 sm:right-8 translate-y-0",
  };

  const isSearchableDropdownTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    Boolean(target.closest('[data-searchable-dropdown="true"]'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-searchable-portal-root="true"
        onPointerDownOutside={(e) => {
          if (!closeOnOutsideClick) {
            // Autorise les clics sur le dropdown du SearchableSelect qui est dans un portail
            if (isSearchableDropdownTarget(e.target)) {
              return;
            }
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (!closeOnOutsideClick) {
            if (isSearchableDropdownTarget(e.target)) {
              return;
            }
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          if (!closeOnOutsideClick) {
            // En mode portal body, le champ de recherche du select sort du contenu Dialog.
            // On autorise le focus vers ce dropdown pour pouvoir cliquer/saisir/scroller.
            if (isSearchableDropdownTarget(e.target)) {
              return;
            }
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnOutsideClick) {
            e.preventDefault();
          }
        }}
        className={cn(
          "w-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] overflow-hidden gap-0 p-0 sm:w-full",
          sizeClasses[size],
          positionClasses[position],
        )}
      >
        <div className="flex max-h-[calc(100dvh-1rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden">
          <div className="border-b border-border px-4 py-3 sm:px-6">
            <DialogHeader className="space-y-2">
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </DialogHeader>
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
            {children}
          </div>
          {footer ? (
            <div className="border-t border-border px-4 py-4 sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
