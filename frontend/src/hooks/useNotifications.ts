import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getNotifications, marquerLue } from "../lib/api/notifications.service";

export type Notification = {
  id: string;
  titre: string;
  message: string;
  typeNotif: string;
  entityType?: string | null;
  isLue: boolean;
  createdAt: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let socket: Socket | null = null;
    let mounted = true;

    getNotifications()
      .then((response: any) => {
        if (mounted) setNotifications(response.data || []);
      })
      .catch(() => {});

    const token = localStorage.getItem("erp_access_token");
    const user = JSON.parse(localStorage.getItem("erp_user") || "null");
    socket = io((import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace("/api/v1", ""), {
      auth: { token, userId: user?.id },
    });

    socket.on("notification", (notification: Notification) => {
      setNotifications((current) => [notification, ...current]);
    });

    return () => {
      mounted = false;
      socket?.disconnect();
    };
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await marquerLue(id);
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, isLue: true } : item)));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isLue).length, [notifications]);

  return { notifications, unreadCount, markAsRead };
}
