import Link from "next/link";
import { RoleGate } from "@/components/auth/RoleGate";

// TODO: el backend no expone GET /users todavía; esta lista queda pendiente.
export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Usuarios</h1>
      <p className="text-sm text-gray-500">
        La lista de usuarios estará disponible cuando el backend exponga un endpoint para consultarlos.
      </p>
      <RoleGate>
        <Link
          href="/usuarios/nuevo"
          className="w-fit rounded bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Crear usuario
        </Link>
      </RoleGate>
    </div>
  );
}
