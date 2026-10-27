// Gestionnaire d'état global de l'application avec persistance dans localStorage.
// Contient les données des utilisateurs, offres, candidatures, conversations,
// messages, notifications, signalements, transactions et formations.
import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  Application,
  Conversation,
  EmployerProfile,
  FlashOffer,
  Message,
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

interface StoreState {
  currentUserId: string;
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

type StoreApi = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<StoreApi | null>(null);

function defaultState(): StoreState {
  return {
    currentUserId: DEMO_USERS[0].id,
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
      return { ...defaultState(), ...parsed };
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

  const update = <K extends keyof StoreState>(key: K, value: StoreState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const patch = <K extends keyof StoreState>(key: K, item: StoreState[K][number]) => {
    setState((prev) => ({ ...prev, [key]: [...prev[key], item] } as StoreState));
  };

  const replace = <K extends keyof StoreState>(key: K, value: StoreState[K][number]) => {
    setState((prev) => ({
      ...prev,
      [key]: prev[key].map((x: any) => (x.id === value.id ? value : x)),
    }) as StoreState);
  };

  const remove = <K extends keyof StoreState>(key: K, id: string) => {
    setState((prev) => ({ ...prev, [key]: prev[key].filter((x: any) => x.id !== id) }) as StoreState);
  };

  const me: User = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? state.users[0],
    [state.users, state.currentUserId]
  );

  return {
    state,
    update,
    patch,
    replace,
    remove,
    setCurrentUser: (id: string) => update("currentUserId", id),
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
