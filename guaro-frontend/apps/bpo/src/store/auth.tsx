import { useState, createContext, useContext, useEffect } from "react";
import type { User } from "@guaro/types";
import { api, setToken, clearToken } from "@/lib/api";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isDevMode: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDevMode = import.meta.env.DEV;

  useEffect(() => {
    const token = localStorage.getItem("guaro_bpo_token");
    if (token) {
      api
        .get<User>("/auth/me")
        .then((user) => setCurrentUser(user))
        .catch(() => clearToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string) {
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/dev-login",
      { email },
    );
    setToken(token);
    setCurrentUser(user);
  }

  function logout() {
    clearToken();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, isDevMode, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
