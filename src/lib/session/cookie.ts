import { SESSION_COOKIE_NAME } from "@/lib/session/constants";
import type { Session } from "@/types/session";

function getCookieValue(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

// La cookie sigue siendo legible por JS (el cliente la necesita para armar el header
// `Authorization`), pero en producción (HTTPS) no debe viajar por HTTP ni en
// contextos cross-site: de ahí `Secure` y `SameSite=Lax`.
export function writeSessionCookie(session: Session): void {
  const value = encodeURIComponent(JSON.stringify(session));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE_NAME}=${value}; path=/; SameSite=Lax${secure}`;
}

export function readSessionCookie(): Session | null {
  const raw = getCookieValue(SESSION_COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
