import { SchedulePlaceholder } from "@/components/schedules/SchedulePlaceholder";

// TODO: feature futura "horarios" — el backend todavía no expone endpoints para esto.
export default function HorariosPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold">Horarios</h1>
      <SchedulePlaceholder />
    </div>
  );
}
