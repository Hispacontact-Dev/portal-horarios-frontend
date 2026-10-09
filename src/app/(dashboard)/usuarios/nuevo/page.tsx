import { RoleGate } from "@/components/auth/RoleGate";
import { UserForm } from "@/components/users/UserForm";

export default function NuevoUsuarioPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Nuevo usuario</h1>
      <RoleGate>
        <UserForm />
      </RoleGate>
    </div>
  );
}
