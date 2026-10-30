"use client";

import { useMemo, useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { DisableConfirmModal } from "@/components/catalog/DisableConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, Th, TheadRow } from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAreas } from "@/lib/hooks/useAreas";
import { usePositions } from "@/lib/hooks/usePositions";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useAreaDisable, usePositionDisable } from "@/lib/hooks/useCatalogDisable";
import { useAreaEditor, usePositionEditor } from "@/lib/hooks/useCatalogEditor";
import { useToast } from "@/lib/hooks/useToast";
import type { ClassifiedError } from "@/lib/api/errors";
import { countEmployeesByAreaId } from "@/lib/utils/catalog";
import type { Area } from "@/types/area";
import type { Position } from "@/types/position";

type CatalogKind = "area" | "cargo";

interface CatalogCopy {
  title: string;
  description: string;
  placeholder: string;
  createLabel: string;
  enabled: string;
  disabled: string;
  enabledPlural: string;
  disabledPlural: string;
  allLabel: string;
  emptyMessage: string;
  demonstrative: string;
}

const COPY: Record<CatalogKind, CatalogCopy> = {
  area: {
    title: "Áreas",
    description: "Agrupan a los empleados y definen el alcance de los líderes de área.",
    placeholder: "Nombre de la nueva área",
    createLabel: "Crear área",
    enabled: "Habilitada",
    disabled: "Deshabilitada",
    enabledPlural: "Habilitadas",
    disabledPlural: "Deshabilitadas",
    allLabel: "Todas",
    emptyMessage: "No hay áreas registradas.",
    demonstrative: "esta área",
  },
  cargo: {
    title: "Cargos",
    description: "Puestos disponibles al crear o editar un empleado.",
    placeholder: "Nombre del nuevo cargo",
    createLabel: "Crear cargo",
    enabled: "Habilitado",
    disabled: "Deshabilitado",
    enabledPlural: "Habilitados",
    disabledPlural: "Deshabilitados",
    allLabel: "Todos",
    emptyMessage: "No hay cargos registrados.",
    demonstrative: "este cargo",
  },
};

type Filter = "all" | "enabled" | "disabled";

interface CatalogoTabProps {
  tipo: CatalogKind;
}

// Pestañas de Áreas y Cargos: el mismo catálogo `{ name, is_enabled }` con otro
// copy, así que comparten componente en vez de duplicarse.
export function CatalogoTab({ tipo }: CatalogoTabProps) {
  return tipo === "area" ? <AreasCatalog /> : <CargosCatalog />;
}

function AreasCatalog() {
  const { status, areas, error } = useAreas();
  const { status: employeesStatus, employees } = useEmployees();
  const [localAreas, setLocalAreas] = useState<Area[] | null>(null);
  const entries = localAreas ?? areas;

  function upsert(area: Area) {
    setLocalAreas((current) => {
      const base = current ?? areas;
      const exists = base.some((entry) => entry.id === area.id);
      return exists ? base.map((entry) => (entry.id === area.id ? area : entry)) : [...base, area];
    });
  }

  const toast = useToast();
  const editor = useAreaEditor((area) => {
    upsert(area);
    toast.show(`«${area.name}» guardada`);
  });
  const catalogDisable = useAreaDisable(
    employees,
    (area) => {
      upsert(area);
      toast.show(`«${area.name}» deshabilitada`);
    },
    (area) => {
      upsert(area);
      toast.show(`«${area.name}» habilitada`);
    }
  );

  const employeeCounts = useMemo(() => countEmployeesByAreaId(employees), [employees]);

  return (
    <CatalogView
      tipo="area"
      status={status}
      loadError={status === "error" ? error.message : null}
      entries={entries}
      employeeCounts={employeeCounts}
      countsLoading={employeesStatus === "loading"}
      editor={editor}
      catalogDisable={catalogDisable}
      toastMessage={toast.message}
    />
  );
}

function CargosCatalog() {
  const { status, positions, error } = usePositions();
  const [localPositions, setLocalPositions] = useState<Position[] | null>(null);
  const entries = localPositions ?? positions;

  function upsert(position: Position) {
    setLocalPositions((current) => {
      const base = current ?? positions;
      const exists = base.some((entry) => entry.id === position.id);
      return exists
        ? base.map((entry) => (entry.id === position.id ? position : entry))
        : [...base, position];
    });
  }

  const toast = useToast();
  const editor = usePositionEditor((position) => {
    upsert(position);
    toast.show(`«${position.name}» guardado`);
  });
  const catalogDisable = usePositionDisable(
    (position) => {
      upsert(position);
      toast.show(`«${position.name}» deshabilitado`);
    },
    (position) => {
      upsert(position);
      toast.show(`«${position.name}» habilitado`);
    }
  );

  return (
    <CatalogView
      tipo="cargo"
      status={status}
      loadError={status === "error" ? error.message : null}
      entries={entries}
      // El Cargo del empleado sigue siendo un enum fijo, no una referencia a este
      // catálogo: no hay conteo que mostrar y no se inventa uno.
      employeeCounts={null}
      countsLoading={false}
      editor={editor}
      catalogDisable={catalogDisable}
      toastMessage={toast.message}
    />
  );
}

interface CatalogEntry {
  id: string;
  name: string;
  is_enabled: boolean;
}

// Contratos estructurales: Áreas y Cargos tienen la misma forma, así que la vista
// es genérica y no necesita castear una en la otra.
interface CatalogEditorApi {
  create: (name: string) => Promise<boolean>;
  rename: (id: string, name: string) => Promise<boolean>;
  createError: ClassifiedError | null;
  renameError: ClassifiedError | null;
  isSubmitting: boolean;
}

interface CatalogDisableApi<T> {
  pendingEntry: T | null;
  affectedCount: number | null;
  isSubmitting: boolean;
  error: ClassifiedError | null;
  requestDisable: (entry: T) => void;
  cancelDisable: () => void;
  confirmDisable: () => void;
  enable: (entry: T) => void;
}

interface CatalogViewProps<T extends CatalogEntry> {
  tipo: CatalogKind;
  status: "loading" | "success" | "error";
  loadError: string | null;
  entries: T[];
  employeeCounts: Map<string, number> | null;
  countsLoading: boolean;
  editor: CatalogEditorApi;
  catalogDisable: CatalogDisableApi<T>;
  toastMessage: string | null;
}

function CatalogView<T extends CatalogEntry>({
  tipo,
  status,
  loadError,
  entries,
  employeeCounts,
  countsLoading,
  editor,
  catalogDisable,
  toastMessage,
}: CatalogViewProps<T>) {
  const copy = COPY[tipo];
  const [draftName, setDraftName] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [renameValidation, setRenameValidation] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (needle === "" || entry.name.toLowerCase().includes(needle)) &&
        (filter === "all" || (filter === "enabled") === entry.is_enabled)
    );
  }, [entries, query, filter]);

  function nameIsTaken(name: string, exceptId?: string): boolean {
    const normalized = name.trim().toLowerCase();
    return entries.some(
      (entry) => entry.id !== exceptId && entry.name.toLowerCase() === normalized
    );
  }

  async function handleCreate() {
    const name = draftName.trim();
    if (name === "") {
      setDuplicateError("Escribí un nombre.");
      return;
    }
    if (nameIsTaken(name)) {
      setDuplicateError("Ya existe una entrada con ese nombre.");
      return;
    }
    setDuplicateError("");
    const saved = await editor.create(name);
    if (saved) setDraftName("");
  }

  async function handleRename() {
    if (editing === null) return;
    const name = editing.name.trim();
    if (name === "") {
      setRenameValidation("Escribí un nombre.");
      return;
    }
    if (nameIsTaken(name, editing.id)) {
      setRenameValidation("Ya existe otra entrada con ese nombre.");
      return;
    }
    setRenameValidation("");
    const saved = await editor.rename(editing.id, name);
    if (saved) setEditing(null);
  }

  function startEditing(entry: CatalogEntry) {
    setRenameValidation("");
    setEditing({ id: entry.id, name: entry.name });
  }

  function cancelEditing() {
    setRenameValidation("");
    setEditing(null);
  }

  const createError = duplicateError || editor.createError?.message || "";
  const actionsDisabled = editor.isSubmitting || catalogDisable.isSubmitting || countsLoading;

  return (
    <section className="panel anim-up flex flex-col gap-[18px] px-[22px] py-5">
      <Corners />

      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">{copy.title}</h2>
        <span className="text-[13px] text-[var(--neutral-700)]">{copy.description}</span>
      </div>

      <RoleGate>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              value={draftName}
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              className={`min-w-[220px] flex-1 ${createError ? "border-[var(--accent-800)]" : ""}`}
              onChange={(event) => {
                setDraftName(event.target.value);
                setDuplicateError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreate();
              }}
            />
            <Button type="button" onClick={handleCreate} disabled={editor.isSubmitting}>
              {copy.createLabel}
            </Button>
          </div>
          {createError && (
            <span role="alert" className="text-xs text-[var(--accent-800)]">
              {createError}
            </span>
          )}
        </div>
      </RoleGate>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--divider)] pt-2.5">
        <Input
          value={query}
          placeholder="Buscar…"
          aria-label={`Buscar en ${copy.title}`}
          className="min-w-[200px] max-w-[300px] flex-1"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex border border-[var(--divider)]">
          {(["all", "enabled", "disabled"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={`h-9 px-3.5 text-[13px] ${
                filter === option
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "text-[var(--neutral-700)] hover:bg-[var(--accent-100)]"
              }`}
            >
              {option === "all"
                ? copy.allLabel
                : option === "enabled"
                  ? copy.enabledPlural
                  : copy.disabledPlural}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--neutral-700)]">
          {visible.length} de {entries.length}
        </span>
      </div>

      {status === "loading" && <Spinner />}
      {status === "error" && loadError && <ErrorState message={loadError} />}

      {status === "success" && entries.length === 0 && (
        <div className="py-9 text-center text-[13px] text-[var(--neutral-700)]">
          {copy.emptyMessage}
        </div>
      )}

      {status === "success" && entries.length > 0 && (
        <div className="overflow-x-auto">
          <Table className="min-w-[620px]">
            <thead>
              <TheadRow>
                <Th>Nombre</Th>
                <Th className="w-[160px]">Empleados</Th>
                <Th className="w-[150px]">Condición</Th>
                <Th className="w-[240px] text-right">Acciones</Th>
              </TheadRow>
            </thead>
            <tbody>
              {visible.map((entry) => {
                const isEditing = editing?.id === entry.id;
                const count = employeeCounts?.get(entry.id) ?? 0;
                return (
                  <tr
                    key={entry.id}
                    className={`border-t border-[var(--divider)] hover:bg-[rgba(238,246,255,.6)] ${
                      entry.is_enabled ? "" : "text-[var(--neutral-700)]"
                    }`}
                  >
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          autoFocus
                          value={editing.name}
                          aria-label={`Nuevo nombre de ${entry.name}`}
                          onChange={(event) => {
                            setRenameValidation("");
                            setEditing({ id: entry.id, name: event.target.value });
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleRename();
                            if (event.key === "Escape") cancelEditing();
                          }}
                        />
                      ) : (
                        <span className="font-medium">{entry.name}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-[var(--neutral-700)]">
                      {/* "Sin dato" y "Ninguno" no son lo mismo: en Cargos el conteo no se
                          puede calcular, en Áreas un cero es un cero real. */}
                      {employeeCounts === null ? (
                        <span title="El Cargo del empleado todavía no referencia este catálogo.">
                          Sin dato
                        </span>
                      ) : count === 0 ? (
                        "Ninguno"
                      ) : (
                        `${count} empleado${count === 1 ? "" : "s"}`
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        className={`inline-flex items-center gap-1.5 ${
                          entry.is_enabled
                            ? "bg-[var(--accent-100)] text-[var(--accent-800)]"
                            : "bg-[#e3e3e5] text-[#3b3b3d]"
                        }`}
                      >
                        <i className="dot-ui" data-on={entry.is_enabled} />
                        {entry.is_enabled ? copy.enabled : copy.disabled}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <RoleGate>
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-[30px] px-3 text-[13px]"
                                onClick={cancelEditing}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                className="h-[30px] px-3 text-[13px]"
                                onClick={handleRename}
                                disabled={editor.isSubmitting}
                              >
                                Guardar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-[30px] px-3 text-[13px]"
                                onClick={() => startEditing(entry)}
                                disabled={actionsDisabled}
                              >
                                Renombrar
                              </Button>
                              {entry.is_enabled ? (
                                <Button
                                  type="button"
                                  variant="danger"
                                  className="h-[30px] px-3 text-[13px]"
                                  onClick={() => catalogDisable.requestDisable(entry)}
                                  disabled={actionsDisabled}
                                >
                                  Deshabilitar
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="h-[30px] px-3 text-[13px]"
                                  onClick={() => catalogDisable.enable(entry)}
                                  disabled={actionsDisabled}
                                >
                                  Habilitar
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </RoleGate>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {visible.length === 0 && (
            <div className="py-9 text-center text-[13px] text-[var(--neutral-700)]">
              Sin resultados para esta búsqueda.
            </div>
          )}
        </div>
      )}

      {renameValidation !== "" && <ErrorState message={renameValidation} />}
      {renameValidation === "" && editor.renameError && (
        <ErrorState message={editor.renameError.message} />
      )}
      {!catalogDisable.pendingEntry && catalogDisable.error && (
        <ErrorState message={catalogDisable.error.message} />
      )}

      <span className="text-[11px] leading-relaxed text-[var(--neutral-700)]">
        Deshabilitar no borra: los empleados que ya lo tienen asignado lo conservan, pero deja de
        aparecer en los formularios nuevos. Todo cambio queda registrado en Auditoría.
      </span>

      <DisableConfirmModal
        isOpen={catalogDisable.pendingEntry !== null}
        entryName={catalogDisable.pendingEntry?.name ?? ""}
        affectedCount={catalogDisable.affectedCount}
        isSubmitting={catalogDisable.isSubmitting}
        error={catalogDisable.pendingEntry ? catalogDisable.error?.message ?? null : null}
        onConfirm={catalogDisable.confirmDisable}
        onCancel={catalogDisable.cancelDisable}
      />

      {toastMessage && <Toast message={toastMessage} />}
    </section>
  );
}
