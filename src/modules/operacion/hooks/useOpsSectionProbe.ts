"use client";

import { useAsyncResource } from "@/lib/hooks/useAsyncResource";

import { listAgents } from "../api/agents";
import { listCampaigns } from "../api/campaigns";
import { listOpsHistory } from "../api/history";
import { listShiftTemplates } from "../api/shifts";
import type { OpsSectionKey } from "../utils/sections";

/**
 * Sonda de conexión de una sub-pestaña: pide el recurso del que depende y expone el estado real.
 *
 * Existe porque ningún endpoint del módulo está publicado todavía (C-02). Mientras eso siga así, la
 * sub-pestaña no puede mostrar datos, pero sí puede mostrar la verdad: qué se intentó y qué
 * respondió el backend. Es lo que reemplaza al texto fijo y lo que hace verificable la capa `api/`
 * sin inventar datos, que `docs/constitution.md` §5 prohíbe.
 *
 * Cuando cada sub-pestaña tenga su propia vista con sus filtros, esta sonda se va con el
 * placeholder.
 */
interface OpsSectionProbe {
  /** El endpoint que se intentó, para que el estado lo nombre. */
  label: string;
  run: (signal: AbortSignal) => Promise<unknown[]>;
}

// Las sub-pestañas que necesitan una campaña elegida (y a veces también una semana o una fecha) no
// pueden pedir su propio recurso sin inventar parámetros, así que sondean su dependencia real: sin
// campañas, ninguna de ellas carga.
const CAMPAIGNS_PROBE: OpsSectionProbe = {
  label: "GET /campanas",
  run: (signal) => listCampaigns(signal),
};

const PROBE_BY_SECTION: Record<OpsSectionKey, OpsSectionProbe> = {
  agentes: {
    label: "GET /agentes",
    run: (signal) => listAgents({ campaign_id: null, status: null }, signal),
  },
  actividades: CAMPAIGNS_PROBE,
  turnos: { label: "GET /turnos", run: (signal) => listShiftTemplates(signal) },
  descansos: CAMPAIGNS_PROBE,
  programacion: CAMPAIGNS_PROBE,
  cobertura: CAMPAIGNS_PROBE,
  publicacion: CAMPAIGNS_PROBE,
  historial: { label: "GET /historial", run: (signal) => listOpsHistory({}, signal) },
};

export function useOpsSectionProbe(sectionKey: OpsSectionKey) {
  const probe = PROBE_BY_SECTION[sectionKey];
  const { state, retry } = useAsyncResource<unknown[]>((signal) => probe.run(signal), [sectionKey]);

  return { label: probe.label, state, retry };
}
