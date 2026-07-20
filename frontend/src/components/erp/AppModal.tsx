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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-searchable-portal-root="true"
        onPointerDownOutside={(e) => {
          if (!closeOnOutsideClick) {
            // Autorise les clics sur le dropdown du SearchableSelect qui est dans un portail
            if (
              (e.target as HTMLElement)?.closest(
                '[data-searchable-dropdown="true"]',
              )
            ) {
              return;
            }
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (!closeOnOutsideClick) {
            if (
              (e.target as HTMLElement)?.closest(
                '[data-searchable-dropdown="true"]',
              )
            ) {
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
          "max-h-[90vh] overflow-hidden p-0",
          sizeClasses[size],
          positionClasses[position],
        )}
      >
        <div className="flex max-h-[90vh] flex-col">
          <div className="border-b border-border px-6 py-5">
            <DialogHeader className="space-y-2">
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="border-t border-border px-6 py-4">{footer}</div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
