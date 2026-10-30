interface SuccessStateProps {
  message: string;
}

export function SuccessState({ message }: SuccessStateProps) {
  return (
    <div role="status" className="border border-[var(--divider)] bg-[var(--accent-100)] px-3 py-2 text-[13px] text-[var(--accent-800)]">
      {message}
    </div>
  );
}
