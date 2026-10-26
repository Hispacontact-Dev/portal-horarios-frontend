import { redirect } from "next/navigation";

export default function EstadosPage() {
  redirect("/configuracion?tab=estados");
}
