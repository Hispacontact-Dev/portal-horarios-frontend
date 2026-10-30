"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { ShiftTemplateList } from "@/components/shiftTemplates/ShiftTemplateList";
import { ShiftTemplateForm } from "@/components/shiftTemplates/ShiftTemplateForm";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useShiftTemplates } from "@/lib/hooks/useShiftTemplates";
import { useToast } from "@/lib/hooks/useToast";
import type { ShiftTemplate } from "@/types/shiftTemplate";
import type { ShiftTemplateFormValues } from "@/lib/hooks/useShiftTemplateForm";

type Draft =
  | { kind: "create" }
  | { kind: "edit"; template: ShiftTemplate }
  | { kind: "duplicate"; source: ShiftTemplate };

function valuesFromDraft(draft: Draft): ShiftTemplateFormValues | undefined {
  if (draft.kind === "edit") {
    return { name: draft.template.name, weekdays: draft.template.weekdays, blocks: draft.template.blocks };
  }
  if (draft.kind === "duplicate") {
    return {
      name: `${draft.source.name} (copia)`,
      weekdays: [...draft.source.weekdays],
      blocks: draft.source.blocks.map((block) => ({ ...block })),
    };
  }
  return undefined;
}

function keyFromDraft(draft: Draft): string {
  if (draft.kind === "edit") return draft.template.id;
  if (draft.kind === "duplicate") return `duplicate-${draft.source.id}`;
  return "create";
}

function titleFromDraft(draft: Draft): string {
  if (draft.kind === "edit") return "Editar plantilla";
  if (draft.kind === "duplicate") return "Duplicar plantilla";
  return "Nueva plantilla";
}

export function PlantillasTab() {
  const { status, shiftTemplates, error } = useShiftTemplates();
  const [localTemplates, setLocalTemplates] = useState<ShiftTemplate[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const toast = useToast();
  const templates = localTemplates ?? shiftTemplates;

  function upsertTemplate(entry: ShiftTemplate) {
    setLocalTemplates((current) => {
      const base = current ?? shiftTemplates;
      const exists = base.some((item) => item.id === entry.id);
      return exists ? base.map((item) => (item.id === entry.id ? entry : item)) : [...base, entry];
    });
    setDraft(null);
    toast.show(`Plantilla «${entry.name}» guardada`);
  }

  return (
    <section className="panel anim-up flex flex-col gap-[18px] px-[22px] py-5">
      <Corners />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold">Plantillas de turno</h2>
          <span className="text-[13px] text-[var(--neutral-700)]">
            Horarios base que se reutilizan al asignar turnos en Horarios.
          </span>
        </div>
        <RoleGate>
          <Button type="button" onClick={() => setDraft({ kind: "create" })}>
            + Nueva plantilla
          </Button>
        </RoleGate>
      </div>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}

      {status === "success" && templates.length === 0 && (
        <div className="py-9 text-center text-[13px] text-[var(--neutral-700)]">
          Todavía no hay plantillas de turno. Creá la primera.
        </div>
      )}

      {status === "success" && templates.length > 0 && (
        <div className="overflow-x-auto">
          <ShiftTemplateList
            templates={templates}
            onEdit={(template) => setDraft({ kind: "edit", template })}
            onDuplicate={(source) => setDraft({ kind: "duplicate", source })}
          />
        </div>
      )}

      <span className="text-[11px] leading-relaxed text-[var(--neutral-700)]">
        Una plantilla admite más de un bloque de horario para cubrir jornadas partidas. Solo cubre
        de lunes a viernes, igual que el resto de Horarios.
      </span>

      {draft !== null && (
        <Dialog
          isOpen
          title={titleFromDraft(draft)}
          onClose={() => setDraft(null)}
          className="max-w-[520px]"
        >
          <ShiftTemplateForm
            key={keyFromDraft(draft)}
            mode={draft.kind === "edit" ? "edit" : "create"}
            templateId={draft.kind === "edit" ? draft.template.id : undefined}
            initialValues={valuesFromDraft(draft)}
            onSuccess={upsertTemplate}
            onCancel={() => setDraft(null)}
          />
        </Dialog>
      )}

      {toast.message && <Toast message={toast.message} />}
    </section>
  );
}
