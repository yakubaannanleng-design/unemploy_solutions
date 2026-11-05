// Gestionnaire d'état global de l'application avec persistance dans localStorage.
// Contient les données des utilisateurs, offres, candidatures, conversations,
// messages, notifications, signalements, transactions et formations.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  Application,
  Conversation,
  EmployerProfile,
  FlashOffer,
  Notification,
  Offer,
  Rating,
  SeekerProfile,
  Signalement,
  Transaction,
  Training,
  User,
} from "../types";
import {
  DEMO_APPLICATIONS,
  DEMO_CONVERSATIONS,
  DEMO_EMPLOYERS,
  DEMO_NOTIFICATIONS,
  DEMO_OFFERS,
  DEMO_SEEKERS,
  DEMO_SIGNALEMENTS,
  DEMO_TRANSACTIONS,
  DEMO_USERS,
} from "../data/mockData";
import { TRAININGS } from "../data/trainings";

const STORE_KEY = "workca:v1";
const STORE_VERSION = 2;

interface StoreState {
  version: number;
  currentUserId: string;
  activeSpaces: Record<string, Workspace>;
  users: User[];
  seekers: SeekerProfile[];
  employers: EmployerProfile[];
  offers: Offer[];
  applications: Application[];
  conversations: Conversation[];
  notifications: Notification[];
  signalements: Signalement[];
  transactions: Transaction[];
  flashOffers: FlashOffer[];
  ratings: Rating[];
  trainings: Training[];
  favorites: string[];
}

type IdListKey = {
  [K in keyof StoreState]: StoreState[K] extends Array<{ id: string }> ? K : never
}[keyof StoreState];

type IdListItem<K extends IdListKey> = Extract<StoreState[K][number], { id: string }>;

type StoreApi = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<StoreApi | null>(null);
export type Workspace = "chercheur" | "employeur";

function defaultState(): StoreState {
  return {
    version: STORE_VERSION,
    currentUserId: DEMO_USERS[0].id,
    activeSpaces: {},
    users: DEMO_USERS,
    seekers: DEMO_SEEKERS,
    employers: DEMO_EMPLOYERS,
    offers: DEMO_OFFERS,
    applications: DEMO_APPLICATIONS,
    conversations: DEMO_CONVERSATIONS,
    notifications: DEMO_NOTIFICATIONS,
    signalements: DEMO_SIGNALEMENTS,
    transactions: DEMO_TRANSACTIONS,
    flashOffers: [],
    ratings: [],
    trainings: TRAININGS,
    favorites: [],
  };
}

function load(): StoreState {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreState>;
      if (parsed.version !== STORE_VERSION) {
        // Migration : réinitialise l'état avec les nouvelles valeurs par défaut.
        return defaultState();
      }
      return {
        ...defaultState(),
        ...parsed,
        favorites: [], // Les favoris sont désormais synchronisés uniquement avec Supabase.
        version: STORE_VERSION,
      };
    }
  } catch {
    /* ignore */
  }
  return defaultState();
}

function useStoreValue() {
  const [state, setState] = useState<StoreState>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const update = useCallback(<K extends keyof StoreState>(key: K, value: StoreState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const patch = useCallback(<K extends keyof StoreState>(key: K, item: StoreState[K][number]) => {
    setState((prev) => ({ ...prev, [key]: [...prev[key], item] } as StoreState));
  }, []);

  const replace = useCallback(<K extends IdListKey>(key: K, value: IdListItem<K>) => {
    setState((prev) => ({
      ...prev,
      [key]: prev[key].map((item) => (item.id === value.id ? value : item)),
    }) as StoreState);
  }, []);

  const remove = useCallback(<K extends IdListKey>(key: K, id: string) => {
    setState((prev) => ({ ...prev, [key]: prev[key].filter((item) => item.id !== id) }) as StoreState);
  }, []);

  const upsertUser = useCallback((user: User) => {
    setState((prev) => ({
      ...prev,
      users: [...prev.users.filter((existing) => existing.id !== user.id), user],
    }));
  }, []);

  const me: User = useMemo(() => {
    const user = state.users.find((item) => item.id === state.currentUserId) ?? state.users[0];
    const activeSpace = state.activeSpaces[state.currentUserId];
    return activeSpace && user.role !== "admin" ? { ...user, role: activeSpace } : user;
  }, [state.activeSpaces, state.users, state.currentUserId]);

  return {
    state,
    update,
    patch,
    replace,
    remove,
    setCurrentUser: useCallback((id: string) => update("currentUserId", id), [update]),
    setActiveSpace: useCallback((space: Workspace) =>
      setState((prev) => ({
        ...prev,
        activeSpaces: { ...prev.activeSpaces, [prev.currentUserId]: space },
      })), []),
    upsertUser,
    currentUser: me,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreValue();
  return createElement(StoreContext.Provider, { value: store, children });
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore doit être utilisé à l'intérieur de StoreProvider.");
  }
  return store;
}
