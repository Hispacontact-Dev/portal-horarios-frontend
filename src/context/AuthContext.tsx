"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { login as loginRequest, logout as logoutRequest } from "@/lib/api/auth";
import { registerSessionInvalidHandler } from "@/lib/api/client";
import { onBroadcastLogout, writeBroadcastSignal } from "@/lib/session/broadcast";
import { clearSessionCookie, readSessionCookie, writeSessionCookie } from "@/lib/session/cookie";
import { INACTIVITY_TIMEOUT_MINUTES, NEXT_QUERY_PARAM } from "@/lib/session/constants";
import { isExpiredByInactivity } from "@/lib/session/expiration";
import { canonicalRole } from "@/lib/utils/role";
import type { LoginRequest } from "@/types/auth";
import type { Session } from "@/types/session";

type AuthStatus = "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const ACTIVITY_EVENTS = ["click", "keydown", "mousemove"] as const;
const ACTIVITY_THROTTLE_MS = 5_000;
const INACTIVITY_CHECK_INTERVAL_MS = 30_000;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cierra la sesión localmente y redirige al login sin aviso previo — RF-4, RF-7.
  const redirectToLoginSilently = useCallback(() => {
    clearSessionCookie();
    setSession(null);
    setStatus("unauthenticated");
    const next = encodeURIComponent(pathnameRef.current || "/dashboard");
    router.replace(`/login?${NEXT_QUERY_PARAM}=${next}`);
  }, [router]);

  // Hidratación al montar — RF-2, RF-4.
  useEffect(() => {
    const stored = readSessionCookie();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    if (isExpiredByInactivity(stored, INACTIVITY_TIMEOUT_MINUTES)) {
      redirectToLoginSilently();
      return;
    }
    setSession(stored);
    setStatus("authenticated");
    // Solo debe correr al montar: la hidratación lee el estado inicial una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interceptor de sesión inválida (401 del backend) — RF-4 (respaldo), RF-7.
  useEffect(() => {
    registerSessionInvalidHandler(redirectToLoginSilently);
  }, [redirectToLoginSilently]);

  // Logout reflejado entre pestañas — RF-3.
  useEffect(() => {
    return onBroadcastLogout(() => {
      setSession(null);
      setStatus("unauthenticated");
      router.replace("/login");
    });
  }, [router]);

  // Vigilancia de inactividad — RF-2, RF-4.
  useEffect(() => {
    if (status !== "authenticated") return;

    let lastRecordedAt = 0;
    function recordActivity() {
      const now = Date.now();
      if (now - lastRecordedAt < ACTIVITY_THROTTLE_MS) return;
      lastRecordedAt = now;

      const current = readSessionCookie();
      if (!current) return;
      const updated: Session = { ...current, lastActivityAt: new Date().toISOString() };
      writeSessionCookie(updated);
      setSession(updated);
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, recordActivity);
    }

    const intervalId = window.setInterval(() => {
      const current = readSessionCookie();
      if (current && isExpiredByInactivity(current, INACTIVITY_TIMEOUT_MINUTES)) {
        redirectToLoginSilently();
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, recordActivity);
      }
      window.clearInterval(intervalId);
    };
  }, [status, redirectToLoginSilently]);

  async function login(data: LoginRequest) {
    setIsLoading(true);
    try {
      const response = await loginRequest(data);
      const now = new Date().toISOString();
      const newSession: Session = {
        token: response.session_token,
        role: canonicalRole(response.role),
        issuedAt: now,
        lastActivityAt: now,
      };
      writeSessionCookie(newSession);
      setSession(newSession);
      setStatus("authenticated");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    clearSessionCookie();
    setSession(null);
    setStatus("unauthenticated");
    writeBroadcastSignal();

    try {
      await logoutRequest();
    } catch {
      // Best-effort: un fallo de red no debe impedir que el logout local se complete — RF-3.
    }

    router.replace("/login");
  }

  return (
    <AuthContext.Provider value={{ status, session, isLoading, login, logout }}>
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
