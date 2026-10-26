import { redirect } from "next/navigation";

export default function NuevoUsuarioPage() {
  redirect("/configuracion?tab=usuarios");
}
