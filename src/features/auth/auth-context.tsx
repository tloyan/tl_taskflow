"use client";

import { User } from "better-auth/types";
import { createContext, useContext } from "react";

type AuthContextType = {
  user: User;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  user: User;
  children: React.ReactNode;
};

export function AuthProvider({ user, children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
