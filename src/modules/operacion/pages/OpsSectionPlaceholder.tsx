"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";

import { OpsPageHeader } from "../components/layout/OpsPageHeader";
import { useOpsSectionProbe } from "../hooks/useOpsSectionProbe";
import { opsSectionByKey, type OpsSectionKey } from "../utils/sections";

interface OpsSectionPlaceholderProps {
  sectionKey: OpsSectionKey;
}

const PENDING_SUFFIX = "esta sub-pestaña se construye en una tarea próxima.";

// Estado real de una sub-pestaña todavía sin pantalla: en vez de un texto fijo, muestra qué le pidió
// al backend y qué contestó. Ningún endpoint del módulo existe todavía (C-02), así que lo honesto es
// mostrar ese error, no datos simulados (`docs/constitution.md` §5).
export function OpsSectionPlaceholder({ sectionKey }: OpsSectionPlaceholderProps) {
  const section = opsSectionByKey(sectionKey);
  const { label, state, retry } = useOpsSectionProbe(sectionKey);

  return (
    <div className="flex flex-col gap-[22px]">
      <OpsPageHeader section={section} />
      <section className="panel anim-up px-[22px] py-5" style={{ animationDelay: ".1s" }}>
        {state.status === "loading" && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-9 text-[13px] text-[var(--neutral-700)]"
          >
            <Spinner />
            <span>Consultando {label}…</span>
          </div>
        )}

        {state.status === "error" && (
          <ErrorState message={`${state.error.message} — ${label}`} onRetry={retry} />
        )}

        {state.status === "empty" && (
          <EmptyState message={`${label} respondió sin registros: ${PENDING_SUFFIX}`} />
        )}

        {state.status === "success" && (
          <EmptyState
            message={`${label} ya responde (${state.data.length} registros): ${PENDING_SUFFIX}`}
          />
        )}
      </section>
    </div>
  );
}
