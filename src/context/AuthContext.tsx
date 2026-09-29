"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { login as loginRequest, logout as logoutRequest } from "@/lib/api/auth";
import type { LoginRequest } from "@/types/auth";
import type { User } from "@/types/user";

interface AuthContextValue {
  token: string | null;
  // TODO: el backend no expone GET /auth/me, por lo que no hay forma de poblar
  // los datos del usuario (nombre/rol) tras iniciar sesión o refrescar la página.
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login(data: LoginRequest) {
    setIsLoading(true);
    try {
      const response = await loginRequest(data);
      setToken(response.session_token);
      // TODO: persistir response.session_token en una cookie legible por JS.
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await logoutRequest();
    setToken(null);
    // TODO: eliminar la cookie de sesión.
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return context;
}
