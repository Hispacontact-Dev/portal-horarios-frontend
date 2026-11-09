"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  addDaysToDayKey,
  bogotaDayEnd,
  bogotaDayStart,
  todayDayKey,
} from "@/lib/utils/date";
import {
  AUDIT_CATEGORIES,
  ENTITY_TYPES_BY_CATEGORY,
  type AuditCategory,
} from "@/lib/utils/history-labels";
import type { HistoryFilters } from "@/types/history";

export const PAGE_SIZE = 30;
const QUERY_DEBOUNCE_MS = 300;
const MAX_QUERY_LENGTH = 100;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Atajos de periodo: días hacia atrás desde hoy; -1 es "sin rango". */
export const PERIOD_PRESETS = [
  { label: "Hoy", days: 0 },
  { label: "7 días", days: 6 },
  { label: "30 días", days: 29 },
  { label: "Todo", days: -1 },
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["label"];

export interface AuditFilters {
  query: string;
  category: AuditCategory;
  actorId: string;
  from: string;
  to: string;
  includeLogins: boolean;
  limit: number;
}

function readDay(value: string | null): string {
  return value !== null && DAY_PATTERN.test(value) ? value : "";
}

function readCategory(value: string | null): AuditCategory {
  return AUDIT_CATEGORIES.includes(value as AuditCategory) ? (value as AuditCategory) : "Todos";
}

function readLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return PAGE_SIZE;
  return Math.min(Math.max(Math.trunc(parsed), PAGE_SIZE), 1000);
}

/**
 * Filtros de Auditoría guardados en la URL, para que la pantalla sea compartible y
 * recargable. Mismo criterio que el `?tab=` de Configuración: `replace` sin scroll, para
 * no llenar el historial del navegador al mover un filtro.
 */
export function useAuditFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const params = searchParams.toString();

  const filters = useMemo<AuditFilters>(() => {
    const current = new URLSearchParams(params);
    const category = readCategory(current.get("cat"));
    return {
      query: (current.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH),
      category,
      actorId: current.get("actor") ?? "",
      from: readDay(current.get("desde")),
      to: readDay(current.get("hasta")),
      // En la categoría Accesos los inicios de sesión son el contenido: no se pueden ocultar.
      includeLogins: category === "Accesos" || current.get("logins") === "1",
      limit: readLimit(current.get("limit")),
    };
  }, [params]);

  const navigate = useCallback(
    (patch: Record<string, string | null>, keepLimit = false) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      // Cambiar cualquier filtro vuelve a la primera página; "Cargar más" es la excepción.
      if (!keepLimit) next.delete("limit");
      const query = next.toString();
      startTransition(() => {
        router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  // El texto se escribe en local y recién después de la pausa viaja a la URL, para no
  // navegar en cada tecla.
  const [draftQuery, setDraftQuery] = useState(filters.query);

  useEffect(() => {
    setDraftQuery(filters.query);
  }, [filters.query]);

  useEffect(() => {
    if (draftQuery.trim() === filters.query) return;
    const timer = setTimeout(() => {
      navigate({ q: draftQuery.trim().slice(0, MAX_QUERY_LENGTH) || null });
    }, QUERY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `navigate` cambia con cada navegación: incluirlo reiniciaría la pausa a mitad de camino.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftQuery, filters.query]);

  const today = todayDayKey();

  const activePreset = useMemo<PeriodPreset | null>(() => {
    const match = PERIOD_PRESETS.find(({ days }) =>
      days < 0
        ? filters.from === "" && filters.to === ""
        : filters.from === addDaysToDayKey(today, -days) && filters.to === today,
    );
    return match?.label ?? null;
  }, [filters.from, filters.to, today]);

  const serverFilters = useMemo<HistoryFilters>(() => {
    const entityTypes =
      filters.category === "Todos" ? [] : ENTITY_TYPES_BY_CATEGORY[filters.category];

    return {
      // El backend acepta un solo `entity_type` por consulta: "Catálogos" agrupa cinco,
      // así que ese caso se filtra en el cliente sobre la lista completa.
      ...(entityTypes.length === 1 ? { entity_type: entityTypes[0] } : {}),
      ...(filters.from !== "" ? { date_from: bogotaDayStart(filters.from) } : {}),
      ...(filters.to !== "" ? { date_to: bogotaDayEnd(filters.to) } : {}),
    };
    // `actorId` no viaja al backend a propósito: filtrar por actor en el servidor dejaría
    // su propio selector con una sola opción. Se aplica en el cliente.
  }, [filters.category, filters.from, filters.to]);

  const hasFilters =
    filters.query !== "" ||
    filters.category !== "Todos" ||
    filters.actorId !== "" ||
    filters.from !== "" ||
    filters.to !== "";

  return {
    filters,
    draftQuery,
    setDraftQuery,
    activePreset,
    serverFilters,
    hasFilters,
    isPending,
    setCategory: (category: AuditCategory) =>
      navigate({ cat: category === "Todos" ? null : category }),
    setActor: (actorId: string) => navigate({ actor: actorId || null }),
    setFrom: (day: string) => navigate({ desde: day || null }),
    setTo: (day: string) => navigate({ hasta: day || null }),
    setPeriod: (days: number) =>
      navigate(
        days < 0
          ? { desde: null, hasta: null }
          : { desde: addDaysToDayKey(today, -days), hasta: today },
      ),
    toggleLogins: () => navigate({ logins: filters.includeLogins ? null : "1" }),
    loadMore: () => navigate({ limit: String(filters.limit + PAGE_SIZE) }, true),
    reset: () => {
      setDraftQuery("");
      startTransition(() => router.replace(pathname, { scroll: false }));
    },
  };
}
