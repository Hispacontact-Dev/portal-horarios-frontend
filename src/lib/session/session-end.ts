import { INACTIVITY_TIMEOUT_MINUTES } from "@/lib/session/constants";

// Motivos por los que el portal cierra una sesión sin que el usuario lo pida. Viajan en la URL
// hacia el login (de ahí que los valores estén en español) y deciden el texto del aviso. El
// logout voluntario no es un motivo: ese sigue siendo silencioso.

export const SESSION_END_REASONS = ["inactividad", "sesion-invalida"] as const;

export type SessionEndReason = (typeof SESSION_END_REASONS)[number];

interface SessionEndCopy {
  title: string;
  body: string;
}

export const SESSION_END_COPY: Record<SessionEndReason, SessionEndCopy> = {
  inactividad: {
    title: "Sesión expirada",
    body: `Por seguridad cerramos tu sesión después de ${INACTIVITY_TIMEOUT_MINUTES} minutos sin actividad. Tenés que iniciar sesión de nuevo para seguir.`,
  },
  "sesion-invalida": {
    title: "Tu sesión ya no es válida",
    body: "El token pudo vencer o tu acceso pudo cambiar. Tenés que iniciar sesión de nuevo para seguir.",
  },
};

/** `null` si el valor no viene o no es un motivo conocido: la URL la escribe cualquiera. */
export function parseSessionEndReason(value: string | null): SessionEndReason | null {
  if (value === null) return null;
  return SESSION_END_REASONS.find((reason) => reason === value) ?? null;
}
