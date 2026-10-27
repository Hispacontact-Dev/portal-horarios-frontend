"use client";

import { useEmployee } from "@/lib/hooks/useEmployee";
import { EmployeeEditView } from "@/components/employees/EmployeeEditView";
import { EmployeeNotFound } from "@/components/employees/EmployeeNotFound";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

export default function EmpleadoPage({ params }: { params: { id: string } }) {
  const { status, employee, error, setEmployee } = useEmployee(params.id);

  if (status === "loading") return <Spinner />;
  if (status === "error" && error.kind === "not_found") return <EmployeeNotFound />;
  if (status === "error") return <ErrorState message={error.message} />;

  return <EmployeeEditView employee={employee} onEmployeeChange={setEmployee} />;
}
