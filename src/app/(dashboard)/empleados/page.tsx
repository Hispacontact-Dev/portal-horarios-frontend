"use client";

import { useEmployees } from "@/lib/hooks/useEmployees";
import { EmployeesView } from "@/components/employees/EmployeesView";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

export default function EmpleadosPage() {
  const { status, employees, error } = useEmployees();

  if (status === "loading") return <Spinner />;
  if (status === "error") return <ErrorState message={error.message} />;

  return <EmployeesView employees={employees} />;
}
