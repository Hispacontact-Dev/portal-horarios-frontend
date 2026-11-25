// El módulo de operación se publica de forma controlada: nace apagado y se enciende por
// entorno. Es publicación controlada, no control de acceso — la variable es `NEXT_PUBLIC_` y
// viaja en el bundle, así que el acceso real lo sostienen el guard por rol y el backend.
export function isOpsModuleEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OPS_ENABLED === "true";
}
