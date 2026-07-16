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
  const dropdownGap = 4;
  const dropdownMaxHeight = 240;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>(
    {},
  );

  const updateDropdownPosition = React.useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(
      dropdownRef.current?.offsetHeight || dropdownMaxHeight,
      dropdownMaxHeight,
    );
    const availableBelow = viewportHeight - rect.bottom;
    const availableAbove = rect.top;
    const shouldOpenUp =
      availableBelow < dropdownHeight + dropdownGap &&
      availableAbove > availableBelow;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      top: shouldOpenUp
        ? Math.max(8, rect.top - dropdownGap - dropdownHeight)
        : rect.bottom + dropdownGap,
      width: rect.width,
      maxHeight: Math.max(
        120,
        Math.min(
          dropdownMaxHeight,
          shouldOpenUp ? availableAbove - 8 : availableBelow - 8,
        ),
      ),
      zIndex: 9999,
    });
  }, []);

  // Fermer si clic en dehors du conteneur
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

  // Focus automatique sur l'input quand le dropdown s'ouvre
  React.useEffect(() => {
    if (open) {
      updateDropdownPosition();
      // Petit délai pour laisser le DOM se mettre à jour
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open, updateDropdownPosition]);

  React.useEffect(() => {
    if (!open) return;

    const handlePosition = () => updateDropdownPosition();
    window.addEventListener("resize", handlePosition);
    window.addEventListener("scroll", handlePosition, true);

    return () => {
      window.removeEventListener("resize", handlePosition);
      window.removeEventListener("scroll", handlePosition, true);
    };
  }, [open, updateDropdownPosition]);

  const filtered = React.useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const selected = options.find((o) => o.value === value);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => {
      if (prev) setSearch("");
      return !prev;
    });
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Bouton déclencheur */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
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
            "ml-2 h-4 w-4 shrink-0 opacity-60 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded-md border bg-popover text-popover-foreground shadow-md"
            style={dropdownStyle}
          >
            <div className="p-2">
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
              className="overflow-y-auto py-1"
              style={{ maxHeight: dropdownStyle.maxHeight }}
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
                      onClick={() => handleSelect(option.value)}
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
