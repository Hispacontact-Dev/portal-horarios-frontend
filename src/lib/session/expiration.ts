import type { Session } from "@/types/session";

export function isExpiredByInactivity(
  session: Session,
  timeoutMinutes: number
): boolean {
  const lastActivityMs = new Date(session.lastActivityAt).getTime();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  return Date.now() - lastActivityMs > timeoutMs;
}
