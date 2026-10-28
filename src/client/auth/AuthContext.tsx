import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api } from "../api/client";
import type { Credentials, User } from "../api/types";

type AuthState = {
  // undefined — состояние ещё загружается с сервера.
  user: User | null | undefined;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Источник правды о входе — сервер (cookie сессии), поэтому авторизация переживает перезагрузку.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    api.me().then(
      (response) => setUser(response.user),
      () => setUser(null),
    );
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      signIn: async (credentials) => setUser(await api.login(credentials)),
      signUp: async (credentials) => setUser(await api.register(credentials)),
      signOut: async () => {
        await api.logout();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth вызван вне AuthProvider");
  }
  return value;
};
