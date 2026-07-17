"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat",
  disabled,
  className,
}: SearchableSelectProps) {
  const dropdownMaxHeight = 240;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pos, setPos] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: dropdownMaxHeight,
  });

  const updatePosition = React.useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - rect.bottom;
    const above = rect.top;
    const up = below < dropdownMaxHeight && above > below;
    const maxH = Math.max(
      120,
      Math.min(dropdownMaxHeight, up ? above - 12 : below - 12),
    );
    const next = {
      left: rect.left,
      top: up ? Math.max(8, rect.top - 4 - maxH) : rect.bottom + 4,
      width: rect.width,
      maxHeight: maxH,
    };
    setPos((prev) => {
      if (
        prev.left === next.left &&
        prev.top === next.top &&
        prev.width === next.width &&
        prev.maxHeight === next.maxHeight
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // Fermer si clic en dehors
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setOpen(false);
        setSearch("");
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Position et focus à l'ouverture
  React.useEffect(() => {
    if (open) {
      updatePosition();
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open, updatePosition]);

  // Reposition au scroll/resize
  React.useEffect(() => {
    if (!open) return;
    const handleResize = () => updatePosition();
    const handleScroll = (e: Event) => {
      // Mettre à jour la position uniquement si le scroll concerne la page (e.target === document).
      // Cela empêche le repositionnement lors du scroll à l'intérieur du dropdown.
      if (e.target !== document) {
        return;
      }
      updatePosition();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", handleResize); // The `true` means it's a capture phase listener.
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePosition]);

  const filtered = React.useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Déclencheur */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => {
            if (prev) setSearch("");
            return !prev;
          });
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors",
          "hover:border-primary",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 opacity-60 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown porté dans document.body */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="flex flex-col rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              width: pos.width,
              maxHeight: pos.maxHeight,
              zIndex: 99999,
            }}
            data-searchable-dropdown="true"
            role="listbox"
          >
            <div className="shrink-0 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    "h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm",
                    "outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    "placeholder:text-muted-foreground",
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpen(false);
                      setSearch("");
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
            </div>

            <div
              className="overflow-y-auto flex-1 py-1"
              style={{ maxHeight: pos.maxHeight - 55 }}
            >
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filtered.map((option) => {
                  const isActive = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive &&
                          "bg-accent text-accent-foreground font-medium",
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {isActive && <Check className="ml-2 h-4 w-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
