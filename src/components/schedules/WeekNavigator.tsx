import { Button } from "@/components/ui/Button";

interface WeekNavigatorProps {
  weekStart: string;
  weekEnd: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekNavigator({ weekStart, weekEnd, canGoPrev, canGoNext, onPrev, onNext }: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="secondary" onClick={onPrev} disabled={!canGoPrev}>
        Semana anterior
      </Button>
      <span className="text-sm text-gray-700">
        {weekStart} – {weekEnd}
      </span>
      <Button type="button" variant="secondary" onClick={onNext} disabled={!canGoNext}>
        Semana siguiente
      </Button>
    </div>
  );
}
