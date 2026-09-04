import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { AUTH_STORAGE_KEYS } from "@/lib/auth-session";
import {
  getNotifications,
  marquerLue,
  marquerToutesLues,
} from "../lib/api/notifications.service";

export type Notification = {
  id: string;
  titre: string;
  message: string;
  typeNotif: string;
  entityType?: string | null;
  isLue: boolean;
  createdAt: string;
};

const NATIVE_NOTIFICATION_PERMISSION_KEY =
  "erp_native_notification_permission_requested";
const NATIVE_NOTIFICATION_SHOWN_IDS_KEY = "erp_native_notification_shown_ids";
const NATIVE_NOTIFICATION_SOUND_KEY = "erp_native_notification_sound_enabled";
const MAX_STORED_NATIVE_NOTIFICATION_IDS = 300;
const SHOW_DESKTOP_WHEN_APP_IS_ACTIVE = true;
const NOTIFICATIONS_FALLBACK_SYNC_INTERVAL_MS = 5 * 60 * 1000;

const isNativeNotificationSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

const shouldShowDesktopNotification = () => {
  if (SHOW_DESKTOP_WHEN_APP_IS_ACTIVE) return true;
  if (typeof document === "undefined") return true;
  return document.hidden || !document.hasFocus();
};

const readShownNativeIds = () => {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = localStorage.getItem(NATIVE_NOTIFICATION_SHOWN_IDS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(
      parsed.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set<string>();
  }
};

const persistShownNativeIds = (ids: Set<string>) => {
  if (typeof window === "undefined") return;
  const kept = Array.from(ids).slice(-MAX_STORED_NATIVE_NOTIFICATION_IDS);
  localStorage.setItem(NATIVE_NOTIFICATION_SHOWN_IDS_KEY, JSON.stringify(kept));
};

const readDesktopNotificationSoundEnabled = () => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(NATIVE_NOTIFICATION_SOUND_KEY);
  return stored === null ? true : stored !== "0";
};

const requestNativePermissionOnce = async () => {
  if (!isNativeNotificationSupported()) return;
  if (window.Notification.permission !== "default") return;
  if (localStorage.getItem(NATIVE_NOTIFICATION_PERMISSION_KEY) === "1") return;

  try {
    const permission = await window.Notification.requestPermission();
    // If browser ignored the prompt (still "default"), keep the key unset for retry.
    if (permission !== "default") {
      localStorage.setItem(NATIVE_NOTIFICATION_PERMISSION_KEY, "1");
    }
  } catch {
    // Silently ignore permission failures to avoid impacting business flow.
  }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [desktopSoundEnabled, setDesktopSoundEnabledState] = useState(
    readDesktopNotificationSoundEnabled,
  );
  const shownNativeIdsRef = useRef<Set<string>>(readShownNativeIds());

  const setDesktopSoundEnabled = useCallback((enabled: boolean) => {
    setDesktopSoundEnabledState(enabled);
    localStorage.setItem(NATIVE_NOTIFICATION_SOUND_KEY, enabled ? "1" : "0");
  }, []);

  const playDesktopNotificationSound = useCallback(() => {
    if (!desktopSoundEnabled || typeof window === "undefined") return;

    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) return;

    try {
      const audioContext = new AudioContextCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.03;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.12);
      oscillator.onended = () => {
        void audioContext.close().catch(() => {});
      };
    } catch {
      // Sound is optional and must never block notifications.
    }
  }, [desktopSoundEnabled]);

  const mergeNotifications = useCallback((incoming: Notification[]) => {
    setNotifications((current) => {
      const byId = new Map<string, Notification>();
      for (const item of current) byId.set(item.id, item);
      for (const item of incoming) byId.set(item.id, item);
      return Array.from(byId.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, []);

  const showDesktopNotification = useCallback(
    (notification: Notification) => {
      if (!isNativeNotificationSupported()) return;
      if (window.Notification.permission !== "granted") return;
      if (!shouldShowDesktopNotification()) return;
      if (shownNativeIdsRef.current.has(notification.id)) return;

      shownNativeIdsRef.current.add(notification.id);
      persistShownNativeIds(shownNativeIdsRef.current);

      const desktopNotification = new window.Notification(notification.titre, {
        body: notification.message,
        tag: `erp-${notification.id}`,
        requireInteraction: true,
      } as NotificationOptions);
      desktopNotification.onclick = () => {
        window.focus();
        desktopNotification.close();
      };
      playDesktopNotificationSound();
    },
    [playDesktopNotificationSound],
  );

  useEffect(() => {
    let socket: Socket | null = null;
    let mounted = true;
    let fallbackIntervalId: number | null = null;
    let syncing = false;
    let permissionRetryUnsubscribe: (() => void) | null = null;

    const syncNotifications = async () => {
      if (syncing) return;
      syncing = true;
      try {
        const response = await getNotifications();
        if (!mounted) return;
        const fetched = Array.isArray(response.data)
          ? (response.data as Notification[])
          : [];

        mergeNotifications(fetched);
        fetched
          .filter((notification) => !notification.isLue)
          .forEach((notification) => {
            showDesktopNotification(notification);
          });
      } catch {
        // keep silent: desktop notifications must never break UI flow
      } finally {
        syncing = false;
      }
    };

    const startFallbackSync = () => {
      if (fallbackIntervalId !== null) return;
      fallbackIntervalId = window.setInterval(() => {
        void syncNotifications();
      }, NOTIFICATIONS_FALLBACK_SYNC_INTERVAL_MS);
    };

    const stopFallbackSync = () => {
      if (fallbackIntervalId === null) return;
      window.clearInterval(fallbackIntervalId);
      fallbackIntervalId = null;
    };

    void syncNotifications();

    const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
    const user = JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEYS.user) || "null",
    );

    void requestNativePermissionOnce();

    // Some browsers only allow permission prompts after a user gesture.
    if (
      isNativeNotificationSupported() &&
      window.Notification.permission === "default"
    ) {
      const retryPermission = () => {
        void requestNativePermissionOnce();
      };
      window.addEventListener("pointerdown", retryPermission, { once: true });
      window.addEventListener("keydown", retryPermission, { once: true });
      permissionRetryUnsubscribe = () => {
        window.removeEventListener("pointerdown", retryPermission);
        window.removeEventListener("keydown", retryPermission);
      };
    }

    const apiUrl =
      import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");

    socket = io(apiOrigin, {
      auth: { token, userId: user?.id },
    });

    socket.on("notification", (notification: Notification) => {
      setNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) return current;
        return [notification, ...current];
      });
      showDesktopNotification(notification);
    });

    socket.on("connect", stopFallbackSync);
    socket.on("disconnect", () => {
      startFallbackSync();
      void syncNotifications();
    });
    socket.on("connect_error", startFallbackSync);

    return () => {
      mounted = false;
      if (permissionRetryUnsubscribe) permissionRetryUnsubscribe();
      stopFallbackSync();
      socket?.disconnect();
    };
  }, [mergeNotifications, showDesktopNotification]);

  const markAsRead = useCallback(async (id: string) => {
    await marquerLue(id);
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, isLue: true } : item)),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await marquerToutesLues();
    setNotifications((items) =>
      items.map((item) => ({ ...item, isLue: true })),
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isLue).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    desktopSoundEnabled,
    setDesktopSoundEnabled,
  };
}
