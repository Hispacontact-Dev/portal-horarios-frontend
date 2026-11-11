"use client";

import { useSearchParams } from "next/navigation";
import { REASON_QUERY_PARAM } from "@/lib/session/constants";
import { parseSessionEndReason, SESSION_END_COPY } from "@/lib/session/session-end";

// Explica en el login por qué el usuario terminó acá. Sin motivo en la URL no renderiza nada,
// así que el login normal se ve igual que siempre.
export function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  const reason = parseSessionEndReason(searchParams.get(REASON_QUERY_PARAM));

  if (reason === null) return null;

  const { title, body } = SESSION_END_COPY[reason];

  return (
    <div
      role="status"
      className="anim-up flex w-full max-w-[420px] flex-col gap-1.5 border border-[var(--accent-800)] bg-[var(--accent-100)] px-5 py-3.5"
    >
      <b className="font-heading text-lg font-semibold uppercase tracking-[.04em] text-[var(--accent-800)]">
        {title}
      </b>
      <span className="text-[13px] leading-relaxed text-[var(--accent-800)]">{body}</span>
    </div>
  );
}
