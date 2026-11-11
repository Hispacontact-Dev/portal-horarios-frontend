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
import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";
import { onBroadcastLogout, writeBroadcastSignal } from "@/lib/session/broadcast";
import { clearSessionCookie, readSessionCookie, writeSessionCookie } from "@/lib/session/cookie";
import {
  INACTIVITY_TIMEOUT_MINUTES,
  NEXT_QUERY_PARAM,
  REASON_QUERY_PARAM,
} from "@/lib/session/constants";
import { isExpiredByInactivity } from "@/lib/session/expiration";
import type { SessionEndReason } from "@/lib/session/session-end";
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
  // Motivo del cierre involuntario de sesión; mientras no sea `null` el aviso bloquea la pantalla.
  const [sessionEnd, setSessionEnd] = useState<SessionEndReason | null>(null);
  // Espejo síncrono de `sessionEnd`: un segundo 401 de la misma tanda no debe reescribir el
  // motivo ni volver a disparar el aviso antes del próximo render.
  const sessionEndRef = useRef<SessionEndReason | null>(null);
  // Pantalla en la que estaba el usuario al expirar, para devolverlo ahí después del login.
  const nextPathRef = useRef("/dashboard");

  const clearSessionLocally = useCallback(() => {
    clearSessionCookie();
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  // Cierra la sesión localmente y va al login, que explica el motivo al llegar — RF-4, RF-7.
  const redirectToLoginWithReason = useCallback(
    (reason: SessionEndReason) => {
      clearSessionLocally();
      const next = encodeURIComponent(pathnameRef.current || "/dashboard");
      router.replace(`/login?${NEXT_QUERY_PARAM}=${next}&${REASON_QUERY_PARAM}=${reason}`);
    },
    [clearSessionLocally, router]
  );

  // Cierra la sesión pero se queda en la pantalla actual mostrando el aviso bloqueante: el
  // usuario ve qué pasó donde estaba trabajando, y el login queda a un click.
  const endSessionWithNotice = useCallback(
    (reason: SessionEndReason) => {
      if (sessionEndRef.current !== null) return;
      // En el login no hay sesión que cerrar ni pantalla previa que preservar.
      if (pathnameRef.current === "/login") return;
      nextPathRef.current = pathnameRef.current || "/dashboard";
      sessionEndRef.current = reason;
      clearSessionLocally();
      setSessionEnd(reason);
    },
    [clearSessionLocally]
  );

  const goToLoginAfterNotice = useCallback(() => {
    const reason = sessionEndRef.current;
    sessionEndRef.current = null;
    setSessionEnd(null);
    const next = encodeURIComponent(nextPathRef.current);
    const reasonParam = reason === null ? "" : `&${REASON_QUERY_PARAM}=${reason}`;
    router.replace(`/login?${NEXT_QUERY_PARAM}=${next}${reasonParam}`);
  }, [router]);

  // Hidratación al montar — RF-2, RF-4.
  useEffect(() => {
    const stored = readSessionCookie();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    if (isExpiredByInactivity(stored, INACTIVITY_TIMEOUT_MINUTES)) {
      // Sin pantalla previa que congelar (la app todavía no se dibujó): va derecho al login.
      redirectToLoginWithReason("inactividad");
      return;
    }
    setSession(stored);
    setStatus("authenticated");
    // Solo debe correr al montar: la hidratación lee el estado inicial una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interceptor de sesión inválida (401 del backend) — RF-4 (respaldo), RF-7.
  useEffect(() => {
    registerSessionInvalidHandler(() => endSessionWithNotice("sesion-invalida"));
  }, [endSessionWithNotice]);

  // Logout reflejado entre pestañas — RF-3.
  useEffect(() => {
    return onBroadcastLogout(() => {
      setSession(null);
      setStatus("unauthenticated");
      // Si el aviso de expiración estaba abierto, el logout de la otra pestaña lo deja sin
      // sentido: se cierra para no tapar el login.
      sessionEndRef.current = null;
      setSessionEnd(null);
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
        endSessionWithNotice("inactividad");
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, recordActivity);
      }
      window.clearInterval(intervalId);
    };
  }, [status, endSessionWithNotice]);

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
    clearSessionLocally();
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
      {sessionEnd !== null && (
        <SessionExpiredModal reason={sessionEnd} onConfirm={goToLoginAfterNotice} />
      )}
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
