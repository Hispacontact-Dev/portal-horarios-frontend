// Notificaciones del módulo (brief §12, listado sin desarrollar).
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. C-13 sigue abierta y bloquea el módulo: no
// están definidos el canal, el evento disparador ni los destinatarios. Por eso acá hay lo mínimo,
// listar y marcar leída, y nada más.

import { z } from "zod";

import { opsNotificationSchema, type OpsNotification } from "../types/notification";
import { opsFetch } from "./client";

// Las del usuario en sesión: el destinatario sale del token, no de un parámetro.
export async function listOpsNotifications(signal?: AbortSignal): Promise<OpsNotification[]> {
  return opsFetch("/notificaciones", z.array(opsNotificationSchema), { signal });
}

// La fecha de lectura la pone el servidor, así que la petición no lleva cuerpo.
export async function markOpsNotificationRead(notificationId: string): Promise<OpsNotification> {
  return opsFetch(`/notificaciones/${notificationId}/leida`, opsNotificationSchema, { method: "PUT" });
}
