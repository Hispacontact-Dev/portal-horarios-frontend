"use client";

import { useState } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { RoleGate } from "@/components/auth/RoleGate";
import { ShiftTemplateTable } from "@/components/shiftTemplates/ShiftTemplateTable";
import { ShiftTemplateForm } from "@/components/shiftTemplates/ShiftTemplateForm";
import { useShiftTemplates } from "@/lib/hooks/useShiftTemplates";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
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

export function PlantillasTab() {
  const { status, shiftTemplates, error } = useShiftTemplates();
  const [localTemplates, setLocalTemplates] = useState<ShiftTemplate[] | null>(null);
  const [draft, setDraft] = useState<Draft>({ kind: "create" });
  const displayedTemplates = localTemplates ?? shiftTemplates;

  function upsertTemplate(entry: ShiftTemplate) {
    const base = localTemplates ?? shiftTemplates;
    const exists = base.some((item) => item.id === entry.id);
    setLocalTemplates(
      exists ? base.map((item) => (item.id === entry.id ? entry : item)) : [...base, entry]
    );
    setDraft({ kind: "create" });
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <section className="panel anim-up flex flex-col gap-3.5 px-5 py-[18px]" style={{ animationDelay: ".05s" }}>
        <Corners />
        <h2 className="font-heading text-[22px] font-semibold">Plantillas de turno</h2>
        <RoleGate>
          <ShiftTemplateForm
            key={keyFromDraft(draft)}
            mode={draft.kind === "edit" ? "edit" : "create"}
            templateId={draft.kind === "edit" ? draft.template.id : undefined}
            initialValues={valuesFromDraft(draft)}
            onSuccess={upsertTemplate}
          />
        </RoleGate>
      </section>

      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && displayedTemplates.length === 0 && (
        <EmptyState message="Todavía no hay plantillas de turno. Creá la primera." />
      )}
      {status === "success" && displayedTemplates.length > 0 && (
        <section className="panel anim-up overflow-x-auto" style={{ animationDelay: ".1s" }}>
          <Corners />
          <ShiftTemplateTable
            templates={displayedTemplates}
            onEdit={(template) => setDraft({ kind: "edit", template })}
            onDuplicate={(template) => setDraft({ kind: "duplicate", source: template })}
          />
        </section>
      )}
    </div>
  );
}
