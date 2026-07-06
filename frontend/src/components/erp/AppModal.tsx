import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl";
type ModalPosition = "center" | "top";

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  position = "center",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
}) {
  const sizeClasses: Record<ModalSize, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  const positionClasses: Record<ModalPosition, string> = {
    center: "top-[50%] -translate-y-[50%]",
    top: "top-6 sm:top-8 translate-y-0",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] overflow-hidden p-0", sizeClasses[size], positionClasses[position])}>
        <div className="flex max-h-[90vh] flex-col">
          <div className="border-b border-border px-6 py-5">
            <DialogHeader className="space-y-2">
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? <div className="border-t border-border px-6 py-4">{footer}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
