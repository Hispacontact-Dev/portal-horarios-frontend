import { RoleGate } from "@/components/auth/RoleGate";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

export default function NuevoEmpleadoPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold">Nuevo empleado</h1>
      <RoleGate>
        <EmployeeForm />
      </RoleGate>
    </div>
  );
}
