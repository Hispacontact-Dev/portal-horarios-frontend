import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  /** Si se provee, muestra la acción "Reintentar" — RF-2, RF-5, RNF-3. */
  onRetry?: () => void;
  /** Advertencia de riesgo de duplicado al reintentar una escritura — RF-5. Solo se muestra junto al botón. */
  retryWarning?: string;
}

export function ErrorState({ message, onRetry, retryWarning }: ErrorStateProps) {
  return (
    <div role="alert" className="border border-[var(--accent-800)] bg-[var(--accent-100)] px-3 py-2 text-[13px] text-[var(--accent-800)]">
      <p>{message}</p>
      {onRetry && (
        <div className="mt-2">
          {retryWarning && <p className="mb-1 text-xs text-[var(--accent-800)]">{retryWarning}</p>}
          <Button type="button" variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
