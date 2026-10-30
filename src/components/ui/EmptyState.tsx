interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-9 text-center">
      <span className="text-[13px] text-[var(--neutral-700)]">{message}</span>
    </div>
  );
}
