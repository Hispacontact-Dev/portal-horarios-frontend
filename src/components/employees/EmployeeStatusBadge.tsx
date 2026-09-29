import { Badge } from "@/components/ui/Badge";

interface EmployeeStatusBadgeProps {
  statusName: string;
}

// TODO: mapear statusName a un color/variante específica.
export function EmployeeStatusBadge({ statusName }: EmployeeStatusBadgeProps) {
  return <Badge>{statusName}</Badge>;
}
