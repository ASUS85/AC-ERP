import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type LoaderTarget = "main" | "page" | "fullscreen";

type LoaderOptions = {
  target?: LoaderTarget;
  label?: string;
  maxDurationMs?: number;
};

type LoaderState = {
  visible: boolean;
  target: LoaderTarget;
  label: string;
};

type GlobalLoaderContextValue = {
  loader: LoaderState;
  showLoader: (options?: LoaderOptions) => () => void;
  hideLoader: () => void;
  runWithLoader: <T>(task: Promise<T>, options?: LoaderOptions) => Promise<T>;
};

const DEFAULT_MAX_DURATION_MS = 500;
const DEFAULT_LABEL = "Chargement...";

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(null);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const timeoutRef = useRef<number | null>(null);
  const activeIdRef = useRef(0);
  const [loader, setLoader] = useState<LoaderState>({
    visible: false,
    target: "main",
    label: DEFAULT_LABEL,
  });

  const clearLoaderTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideLoader = useCallback(() => {
    clearLoaderTimeout();
    activeIdRef.current += 1;
    setLoader((current) => ({ ...current, visible: false }));
  }, [clearLoaderTimeout]);

  const showLoader = useCallback(
    (options: LoaderOptions = {}) => {
      clearLoaderTimeout();

      const requestId = activeIdRef.current + 1;
      activeIdRef.current = requestId;
      const maxDurationMs = options.maxDurationMs ?? DEFAULT_MAX_DURATION_MS;

      setLoader({
        visible: true,
        target: options.target ?? "main",
        label: options.label ?? DEFAULT_LABEL,
      });

      timeoutRef.current = window.setTimeout(() => {
        if (activeIdRef.current === requestId) {
          setLoader((current) => ({ ...current, visible: false }));
          timeoutRef.current = null;
        }
      }, maxDurationMs);

      return () => {
        if (activeIdRef.current === requestId) hideLoader();
      };
    },
    [clearLoaderTimeout, hideLoader],
  );

  const runWithLoader = useCallback(
    async <T,>(task: Promise<T>, options?: LoaderOptions) => {
      const stop = showLoader(options);
      try {
        return await task;
      } finally {
        stop();
      }
    },
    [showLoader],
  );

  useEffect(() => clearLoaderTimeout, [clearLoaderTimeout]);

  const value = useMemo(
    () => ({ loader, showLoader, hideLoader, runWithLoader }),
    [hideLoader, loader, runWithLoader, showLoader],
  );

  return <GlobalLoaderContext.Provider value={value}>{children}</GlobalLoaderContext.Provider>;
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (!context) throw new Error("useGlobalLoader must be used within GlobalLoaderProvider.");
  return context;
}

export function GlobalLoaderSlot({ target = "main", className }: { target?: LoaderTarget; className?: string }) {
  const { loader } = useGlobalLoader();

  if (!loader.visible || loader.target !== target) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex min-h-48 items-center justify-center rounded-lg bg-background/85 backdrop-blur-sm",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={loader.label}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <span className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <span className="absolute inset-3 rounded-full bg-primary/10" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{loader.label}</p>
      </div>
    </div>
  );
}
