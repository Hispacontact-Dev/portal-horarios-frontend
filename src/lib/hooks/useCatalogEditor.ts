"use client";

import { createArea, updateArea } from "@/lib/api/areas";
import { createPosition, updatePosition } from "@/lib/api/positions";
import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import type { ClassifiedError } from "@/lib/api/errors";
import type { Area } from "@/types/area";
import type { Position } from "@/types/position";

interface CatalogEntry {
  id: string;
  name: string;
}

interface RenameInput {
  id: string;
  name: string;
}

interface UseCatalogEditorOptions<T extends CatalogEntry> {
  createEntry: (name: string) => Promise<T>;
  renameEntry: (input: RenameInput) => Promise<T>;
  onSaved: (entry: T) => void;
}

/**
 * Alta y renombrado de una entrada de catálogo, para la fila de creación y la
 * edición en línea de la pestaña de Áreas/Cargos.
 *
 * Reemplaza a `useAreaForm`/`usePositionForm`: ahí el formulario era un panel
 * aparte con su propio estado de campos; acá el nombre lo maneja el componente y
 * el hook solo se ocupa de la escritura.
 */
export function useCatalogEditor<T extends CatalogEntry>({
  createEntry,
  renameEntry,
  onSaved,
}: UseCatalogEditorOptions<T>) {
  const createAction = useAsyncAction<string, T>(createEntry);
  const renameAction = useAsyncAction<RenameInput, T>(renameEntry);

  async function create(name: string): Promise<boolean> {
    const created = await createAction.submit(name);
    if (created === undefined) return false;
    onSaved(created);
    return true;
  }

  async function rename(id: string, name: string): Promise<boolean> {
    const renamed = await renameAction.submit({ id, name });
    if (renamed === undefined) return false;
    onSaved(renamed);
    return true;
  }

  const createError: ClassifiedError | null =
    createAction.state.status === "error" ? createAction.state.error : null;
  const renameError: ClassifiedError | null =
    renameAction.state.status === "error" ? renameAction.state.error : null;

  return {
    create,
    rename,
    createError,
    renameError,
    isSubmitting:
      createAction.state.status === "submitting" || renameAction.state.status === "submitting",
  };
}

export function useAreaEditor(onSaved: (area: Area) => void) {
  return useCatalogEditor<Area>({
    createEntry: (name) => createArea({ name }),
    renameEntry: ({ id, name }) => updateArea(id, { name }),
    onSaved,
  });
}

export function usePositionEditor(onSaved: (position: Position) => void) {
  return useCatalogEditor<Position>({
    createEntry: (name) => createPosition({ name }),
    renameEntry: ({ id, name }) => updatePosition(id, { name }),
    onSaved,
  });
}
