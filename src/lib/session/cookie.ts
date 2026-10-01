import { SESSION_COOKIE_NAME } from "@/lib/session/constants";
import type { Session } from "@/types/session";

function getCookieValue(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

export function writeSessionCookie(session: Session): void {
  const value = encodeURIComponent(JSON.stringify(session));
  document.cookie = `${SESSION_COOKIE_NAME}=${value}; path=/`;
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
