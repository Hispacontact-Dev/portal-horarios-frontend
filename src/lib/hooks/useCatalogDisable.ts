"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import { disableArea, enableArea } from "@/lib/api/areas";
import { disableStatus, enableStatus } from "@/lib/api/statuses";
import { countEmployeesByArea, countEmployeesByStatus } from "@/lib/utils/catalog";
import type { Employee } from "@/types/employee";
import type { Area } from "@/types/area";
import type { Status } from "@/types/status";

interface CatalogEntry {
  id: string;
  is_enabled: boolean;
}

interface CatalogDisableResult<T extends CatalogEntry> {
  entry: T;
  affectedEmployees: number;
}

export interface UseCatalogDisableOptions<T extends CatalogEntry> {
  employees: Employee[];
  countAffected: (employees: Employee[], entryId: string) => number;
  disableEntry: (id: string) => Promise<CatalogDisableResult<T>>;
  enableEntry: (id: string) => Promise<T>;
  onDisabled: (entry: T) => void;
  onEnabled: (entry: T) => void;
}

interface CatalogDisableState {
  isSubmitting: boolean;
  error: ClassifiedError | null;
}

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

// El backend rechaza deshabilitar la última entrada habilitada del catálogo con 409
// (catalog_service.py::LastEnabledEntryError), pero usa HTTPException sin exception handler
// propio: el body real es siempre {"detail": "<texto>"}, nunca {"message", "code"}. No hay campo
// estructurado para distinguir este 409 de otro (p. ej. nombre duplicado) salvo el texto fijo que
// el backend siempre genera igual para este caso.
const LAST_ENABLED_ERROR_SUBSTRING = "No se puede deshabilitar la última";
const LAST_ENABLED_MESSAGE =
  "No se puede deshabilitar: debe quedar al menos una entrada habilitada en el catálogo.";

function isLastEnabledConflict(err: ApiError): boolean {
  const detail = err.body?.detail;
  return typeof detail === "string" && detail.includes(LAST_ENABLED_ERROR_SUBSTRING);
}

function classify(err: unknown): ClassifiedError {
  if (!(err instanceof ApiError)) return UNKNOWN_ERROR;
  if (err.status === 409 && isLastEnabledConflict(err)) {
    return { kind: "conflict", message: LAST_ENABLED_MESSAGE };
  }
  return classifyError(err) ?? UNKNOWN_ERROR;
}

export function useCatalogDisable<T extends CatalogEntry>({
  employees,
  countAffected,
  disableEntry,
  enableEntry,
  onDisabled,
  onEnabled,
}: UseCatalogDisableOptions<T>) {
  const [pendingEntry, setPendingEntry] = useState<T | null>(null);
  const [state, setState] = useState<CatalogDisableState>({ isSubmitting: false, error: null });

  function requestDisable(entry: T) {
    setState({ isSubmitting: false, error: null });
    setPendingEntry(entry);
  }

  function cancelDisable() {
    setPendingEntry(null);
    setState({ isSubmitting: false, error: null });
  }

  async function confirmDisable() {
    if (!pendingEntry || state.isSubmitting) return;

    setState({ isSubmitting: true, error: null });

    try {
      const result = await disableEntry(pendingEntry.id);
      setState({ isSubmitting: false, error: null });
      setPendingEntry(null);
      // result.affectedEmployees es el conteo autoritativo del backend (hoy siempre 0, bug
      // conocido). No hay sistema de toasts en el proyecto para mostrarlo; refrescar la entrada
      // con el estado real de la respuesta ya reconcilia el conteo local con el servidor.
      onDisabled(result.entry);
    } catch (err) {
      // pendingEntry queda intacto a propósito: el modal sigue abierto mostrando el error.
      setState({ isSubmitting: false, error: classify(err) });
    }
  }

  async function enable(entry: T) {
    if (state.isSubmitting) return;

    setState({ isSubmitting: true, error: null });

    try {
      const updated = await enableEntry(entry.id);
      setState({ isSubmitting: false, error: null });
      onEnabled(updated);
    } catch (err) {
      setState({ isSubmitting: false, error: classify(err) });
    }
  }

  return {
    pendingEntry,
    affectedCount: pendingEntry ? countAffected(employees, pendingEntry.id) : 0,
    isSubmitting: state.isSubmitting,
    error: state.error,
    requestDisable,
    cancelDisable,
    confirmDisable,
    enable,
  };
}

export function useAreaDisable(
  employees: Employee[],
  onDisabled: (area: Area) => void,
  onEnabled: (area: Area) => void
) {
  return useCatalogDisable<Area>({
    employees,
    countAffected: countEmployeesByArea,
    disableEntry: async (id: string) => {
      const result = await disableArea(id);
      return { entry: result.area, affectedEmployees: result.affected_employees };
    },
    enableEntry: enableArea,
    onDisabled,
    onEnabled,
  });
}

export function useStatusDisable(
  employees: Employee[],
  onDisabled: (status: Status) => void,
  onEnabled: (status: Status) => void
) {
  return useCatalogDisable<Status>({
    employees,
    countAffected: countEmployeesByStatus,
    disableEntry: async (id: string) => {
      const result = await disableStatus(id);
      return { entry: result.status, affectedEmployees: result.affected_employees };
    },
    enableEntry: enableStatus,
    onDisabled,
    onEnabled,
  });
}
