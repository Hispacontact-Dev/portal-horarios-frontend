import { redirect } from "next/navigation";
import { OPS_SECTIONS } from "@ops/utils";

// La ruta base no tiene pantalla propia: aterriza en la primera sub-pestaña del módulo.
export default function OperacionPage() {
  redirect(OPS_SECTIONS[0].path);
}
