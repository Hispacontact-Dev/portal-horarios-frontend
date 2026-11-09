interface EmployeeStatusBadgeProps {
  statusName: string;
}

export function EmployeeStatusBadge({ statusName }: EmployeeStatusBadgeProps) {
  return (
    <span className="border border-[var(--accent)] px-2 py-0.5 text-[11px] text-[var(--accent-800)]">
      {statusName}
    </span>
  );
}
