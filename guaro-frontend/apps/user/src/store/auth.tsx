/// <reference types="vite/client" />
import { useState, createContext, useContext } from "react";
import type { User } from "@guaro/types";
import { mockCurrentUser, devUsers as allDevUsers } from "@guaro/mock-data";

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);
  const isDevMode = import.meta.env.DEV;

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isDevMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { allDevUsers as devUsers };
