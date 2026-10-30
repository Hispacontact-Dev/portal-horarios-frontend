"use client";

import { type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuccessState } from "@/components/ui/SuccessState";
import { useSuccessFlag } from "@/lib/hooks/useSuccessFlag";
import {
  useShiftTemplateForm,
  type ShiftTemplateFormMode,
  type ShiftTemplateFormValues,
} from "@/lib/hooks/useShiftTemplateForm";
import type { ShiftTemplate } from "@/types/shiftTemplate";
import type { Weekday } from "@/types/schedule";
import { cn } from "@/lib/utils/cn";

const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: "monday", label: "L" },
  { value: "tuesday", label: "M" },
  { value: "wednesday", label: "X" },
  { value: "thursday", label: "J" },
  { value: "friday", label: "V" },
];

interface ShiftTemplateFormProps {
  mode: ShiftTemplateFormMode;
  templateId?: string;
  initialValues?: ShiftTemplateFormValues;
  onSuccess: (template: ShiftTemplate) => void;
}

export function ShiftTemplateForm({ mode, templateId, initialValues, onSuccess }: ShiftTemplateFormProps) {
  const successFlag = useSuccessFlag();

  function handleSuccess(result: ShiftTemplate) {
    successFlag.show();
    onSuccess(result);
  }

  const { values, isSubmitting, error, setField, submit } = useShiftTemplateForm({
    mode,
    templateId,
    initialValues,
    onSuccess: handleSuccess,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    successFlag.hide();
    submit(values);
  }

  function toggleWeekday(day: Weekday) {
    successFlag.hide();
    const weekdays = values.weekdays.includes(day)
      ? values.weekdays.filter((d) => d !== day)
      : [...values.weekdays, day];
    setField("weekdays", weekdays);
  }

  function updateBlock(index: number, field: "start" | "end", value: string) {
    successFlag.hide();
    setField(
      "blocks",
      values.blocks.map((block, i) => (i === index ? { ...block, [field]: value } : block))
    );
  }

  function addBlock() {
    successFlag.hide();
    setField("blocks", [...values.blocks, { start: "08:00", end: "17:00" }]);
  }

  function removeBlock(index: number) {
    successFlag.hide();
    setField("blocks", values.blocks.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        name="name"
        placeholder="Nombre de la plantilla"
        value={values.name}
        onChange={(event) => {
          successFlag.hide();
          setField("name", event.target.value);
        }}
        required
        maxLength={100}
      />

      <div className="flex gap-1">
        {WEEKDAY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={values.weekdays.includes(value)}
            onClick={() => toggleWeekday(value)}
            className={cn(
              "font-heading grid h-[38px] w-[38px] flex-none place-items-center border border-[var(--accent)] text-sm font-semibold transition-colors",
              values.weekdays.includes(value)
                ? "bg-[var(--accent)] text-[var(--bg)]"
                : "text-[var(--accent-700)] hover:bg-[var(--accent-100)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {values.blocks.map((block, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="time"
              value={block.start}
              onChange={(event) => updateBlock(index, "start", event.target.value)}
              required
            />
            <span className="text-sm text-[var(--neutral-700)]">a</span>
            <Input
              type="time"
              value={block.end}
              onChange={(event) => updateBlock(index, "end", event.target.value)}
              required
            />
            {values.blocks.length > 1 && (
              <Button type="button" variant="secondary" onClick={() => removeBlock(index)}>
                Quitar
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addBlock} className="self-start">
          + Agregar bloque
        </Button>
      </div>

      {successFlag.visible && <SuccessState message="Cambios guardados" />}
      {error && <ErrorState message={error.message} />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : mode === "create" ? "Crear plantilla" : "Guardar cambios"}
      </Button>
    </form>
  );
}
