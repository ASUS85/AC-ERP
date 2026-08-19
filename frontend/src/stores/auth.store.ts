import { create } from "zustand";
import { getMe, getSessions } from "@/lib/api/auth.service";
import {
  AUTH_STORAGE_KEYS,
  getStoredUser,
  storeAuthSession,
  type AuthUserLike,
} from "@/lib/auth-session";

const PROFILE_CACHE_TTL_MS = 30 * 60 * 1000;
const SESSIONS_CACHE_TTL_MS = 5 * 60 * 1000;

let pendingProfileRequest: Promise<AuthUserLike> | null = null;
let pendingSessionsRequest: Promise<Record<string, unknown>[]> | null = null;

type AuthStore = {
  user: AuthUserLike | null;
  token: string | null;
  fetchedAt: number | null;
  loading: boolean;
  sessions: Record<string, unknown>[] | null;
  sessionsFetchedAt: number | null;
  fetchProfile: (force?: boolean) => Promise<AuthUserLike>;
  fetchSessions: (force?: boolean) => Promise<Record<string, unknown>[]>;
  setSessions: (sessions: Record<string, unknown>[]) => void;
  invalidateSessions: () => void;
  setUser: (user: AuthUserLike | null) => void;
  invalidateProfile: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  fetchedAt: null,
  loading: false,
  sessions: null,
  sessionsFetchedAt: null,

  async fetchProfile(force = false) {
    const { user, token, fetchedAt } = get();
    const now = Date.now();
    const currentToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
    const cachedUser = user || getStoredUser<AuthUserLike>();
    const cacheIsValid =
      !force &&
      cachedUser !== null &&
      token === currentToken &&
      fetchedAt !== null &&
      now - fetchedAt < PROFILE_CACHE_TTL_MS;

    if (cacheIsValid) return cachedUser;
    if (!force && cachedUser !== null && token === null && currentToken) {
      set({ user: cachedUser, token: currentToken, fetchedAt: now });
      return cachedUser;
    }
    if (pendingProfileRequest) return pendingProfileRequest;

    set({ loading: true });
    pendingProfileRequest = getMe()
      .then((response) => {
        const profile = response.data as AuthUserLike;
        storeAuthSession({ user: profile });
        set({
          user: profile,
          token: currentToken,
          fetchedAt: Date.now(),
          loading: false,
        });
        return profile;
      })
      .finally(() => {
        pendingProfileRequest = null;
        set({ loading: false });
      });

    return pendingProfileRequest;
  },

  setUser(user) {
    set({
      user,
      token: user ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) : null,
      fetchedAt: user ? Date.now() : null,
    });
  },

  async fetchSessions(force = false) {
    const { sessions, sessionsFetchedAt } = get();
    if (
      !force &&
      sessions !== null &&
      sessionsFetchedAt !== null &&
      Date.now() - sessionsFetchedAt < SESSIONS_CACHE_TTL_MS
    ) {
      return sessions;
    }
    if (pendingSessionsRequest) return pendingSessionsRequest;

    pendingSessionsRequest = getSessions()
      .then((response) => {
        const sessions = (response.data || []) as Record<string, unknown>[];
        set({ sessions, sessionsFetchedAt: Date.now() });
        return sessions;
      })
      .finally(() => {
        pendingSessionsRequest = null;
      });
    return pendingSessionsRequest;
  },

  setSessions(sessions) {
    set({ sessions, sessionsFetchedAt: Date.now() });
  },

  invalidateSessions() {
    set({ sessionsFetchedAt: null });
  },

  invalidateProfile() {
    set({ fetchedAt: null });
  },
}));
