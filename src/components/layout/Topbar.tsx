"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

// TODO: mostrar nombre/rol del usuario cuando el backend exponga GET /auth/me.
export function Topbar() {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b p-4">
      <span className="text-sm font-medium">Portal Horarios</span>
      <Button variant="secondary" onClick={() => logout()}>
        Cerrar sesión
      </Button>
    </header>
  );
}
