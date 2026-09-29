import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import {
  canAccessPermission,
  getStoredUser,
  type AuthUserLike,
} from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BUTTON_SIZE = 56; // 56px de diamètre
const MARGIN = 16; // 16px de marge minimale avec les bords de l'écran
const STORAGE_KEY = "erp_floating_assistant_position";
const DRAG_THRESHOLD = 6; // Seuil en pixels pour différencier un clic d'un glisser

interface Position {
  x: number;
  y: number;
}

export function FloatingAssistantButton() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [user, setUser] = useState<AuthUserLike | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Références pour la gestion du drag sans latence de state
  const pointerDownPos = useRef<Position | null>(null);
  const initialButtonPos = useRef<Position>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const currentPosRef = useRef<Position | null>(null);
  const ignoreNextClickRef = useRef(false);

  // Synchronisation de l'utilisateur et de ses permissions
  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();

    window.addEventListener("auth-change", syncUser);
    window.addEventListener("erp:user-updated", syncUser);
    window.addEventListener("user-access-updated", syncUser);

    return () => {
      window.removeEventListener("auth-change", syncUser);
      window.removeEventListener("erp:user-updated", syncUser);
      window.removeEventListener("user-access-updated", syncUser);
    };
  }, []);

  // Fonction de clamping pour garantir que l'icône reste toujours dans le viewport
  const clampPosition = useCallback((pos: Position): Position => {
    if (typeof window === "undefined") return pos;
    const maxX = Math.max(MARGIN, window.innerWidth - BUTTON_SIZE - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - BUTTON_SIZE - MARGIN);
    return {
      x: Math.min(Math.max(pos.x, MARGIN), maxX),
      y: Math.min(Math.max(pos.y, MARGIN), maxY),
    };
  }, []);

  // Initialisation de la position (depuis localStorage ou position par défaut à l'extrême droite)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialX = window.innerWidth - BUTTON_SIZE - 24;
    let initialY = window.innerHeight - BUTTON_SIZE - 32;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Position;
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          initialX = parsed.x;
          initialY = parsed.y;
        }
      }
    } catch {
      // Ignorer l'erreur et utiliser la position par défaut
    }

    const clamped = clampPosition({ x: initialX, y: initialY });
    setPosition(clamped);
    currentPosRef.current = clamped;
  }, [clampPosition]);

  // Recalcul en cas de redimensionnement de la fenêtre ou rotation d'écran mobile
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const clamped = clampPosition(prev);
        currentPosRef.current = clamped;
        return clamped;
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [clampPosition]);

  // Gestion des événements Pointer (souris + tactile unifiés)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Uniquement clic gauche / toucher principal
    if (!position) return;

    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    initialButtonPos.current = { ...position };
    isDraggingRef.current = false;
    setIsDragging(false);
    setTooltipOpen(false);

    // Capture le pointeur pour continuer à suivre les mouvements même hors du bouton
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore si le navigateur ne supporte pas la capture
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDownPos.current) return;

    const deltaX = e.clientX - pointerDownPos.current.x;
    const deltaY = e.clientY - pointerDownPos.current.y;

    // Détection du seuil de déplacement pour passer en mode "drag"
    if (!isDraggingRef.current && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setIsDragging(true);
      setTooltipOpen(false);
    }

    if (isDraggingRef.current) {
      const newPos = clampPosition({
        x: initialButtonPos.current.x + deltaX,
        y: initialButtonPos.current.y + deltaY,
      });

      currentPosRef.current = newPos;
      setPosition(newPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDownPos.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorer si déjà libéré
    }

    const wasDragging = isDraggingRef.current;
    pointerDownPos.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (wasDragging) {
      // Empêche le clic consécutif d'ouvrir l'assistant
      ignoreNextClickRef.current = true;
      setTimeout(() => {
        ignoreNextClickRef.current = false;
      }, 100);

      // Sauvegarder la nouvelle position
      if (currentPosRef.current) {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(currentPosRef.current),
          );
        } catch {
          // Ignorer si localStorage restreint
        }
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorer
    }
    pointerDownPos.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Clic standard (ou activation clavier Enter / Espace)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ignoreNextClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      ignoreNextClickRef.current = false;
      return;
    }
    navigate({ to: "/assistant" });
  };

  // Vérification de la permission 'ia:chat'
  const canChat = canAccessPermission(user, "ia", "chat");

  // Masquer si non autorisé, si position non prête, ou si l'utilisateur est déjà sur la page assistant
  const isAssistantPage =
    pathname === "/assistant" || pathname.startsWith("/assistant/");

  if (!user || !canChat || isAssistantPage || !position) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip
        open={isDragging ? false : tooltipOpen}
        onOpenChange={(open) => {
          if (!isDragging) setTooltipOpen(open);
        }}
      >
        <TooltipTrigger asChild>
          <button
            type="button"
            role="button"
            aria-label="Ouvrir l'assistant ERP"
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              touchAction: "none",
            }}
            className={cn(
              "fixed z-50 flex h-14 w-14 select-none items-center justify-center rounded-full",
              "bg-gradient-to-tr from-primary via-primary/95 to-indigo-600 text-primary-foreground",
              "border-2 border-white/25 shadow-xl shadow-primary/30",
              "cursor-grab active:cursor-grabbing",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isDragging
                ? "scale-105 shadow-2xl ring-4 ring-primary/25"
                : "transition-[box-shadow,transform] duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 active:scale-95",
            )}
          >
            {/* Icône Robot */}
            <Bot className="h-7 w-7 text-white drop-shadow-sm transition-transform duration-200" />

            {/* Badge animé indiquant la disponibilité de l'IA */}
            <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          sideOffset={14}
          className="rounded-xl border border-border/60 bg-popover/95 px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-lg backdrop-blur-sm"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-primary">Assistant ERP</span>
            <span className="text-[10px] text-muted-foreground">
              Cliquez pour ouvrir • Glissez pour déplacer
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
