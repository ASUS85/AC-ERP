import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { c as cn } from "./router-Dv1ROSYY.js";
const Dialog = SheetPrimitive.Root;
const DialogPortal = SheetPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = SheetPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = SheetPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = SheetPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = SheetPrimitive.Description.displayName;
function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  position = "center",
  closeOnOutsideClick = false
}) {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
    xxl: "sm:max-w-6xl"
  };
  const positionClasses = {
    center: "top-[50%] -translate-y-[50%]",
    top: "top-6 sm:top-8 translate-y-0",
    right: "top-6 sm:top-8 right-6 sm:right-8 translate-y-0"
  };
  const isSearchableDropdownTarget = (target) => target instanceof HTMLElement && Boolean(target.closest('[data-searchable-dropdown="true"]'));
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsx(
    DialogContent,
    {
      "data-searchable-portal-root": "true",
      onPointerDownOutside: (e) => {
        if (!closeOnOutsideClick) {
          if (isSearchableDropdownTarget(e.target)) {
            return;
          }
          e.preventDefault();
        }
      },
      onInteractOutside: (e) => {
        if (!closeOnOutsideClick) {
          if (isSearchableDropdownTarget(e.target)) {
            return;
          }
          e.preventDefault();
        }
      },
      onFocusOutside: (e) => {
        if (!closeOnOutsideClick) {
          if (isSearchableDropdownTarget(e.target)) {
            return;
          }
          e.preventDefault();
        }
      },
      onEscapeKeyDown: (e) => {
        if (!closeOnOutsideClick) {
          e.preventDefault();
        }
      },
      className: cn(
        "max-h-[90vh] overflow-visible p-0",
        sizeClasses[size],
        positionClasses[position]
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "flex max-h-[90vh] flex-col", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-border px-6 py-5", children: /* @__PURE__ */ jsxs(DialogHeader, { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: title }),
          description ? /* @__PURE__ */ jsx(DialogDescription, { children: description }) : null
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-5", children }),
        footer ? /* @__PURE__ */ jsx("div", { className: "border-t border-border px-6 py-4", children: footer }) : null
      ] })
    }
  ) });
}
export {
  AppModal as A
};
