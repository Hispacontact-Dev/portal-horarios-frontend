// Notificaciones del módulo (brief §12). El brief lista el módulo y NO lo desarrolla.
//
// C-13 sigue abierta y bloquea el módulo entero: no están definidos el canal (correo, in-app,
// WhatsApp), el evento disparador ni los destinatarios. Por eso este tipo es deliberadamente
// mínimo: solo lo que cualquier notificación tiene sí o sí. No lleva `channel` ni `event` porque
// inventarlos sería cerrar la decisión desde el frontend.
//
// Tampoco lleva destinatario: la lista se pide autenticado y son las del usuario en sesión, igual
// que el resto de las lecturas del portal.

import { z } from "zod";

export const opsNotificationSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  message: z.string(),
  // `null` mientras el usuario no la haya leído.
  read_at: z.string().nullable(),
});

export type OpsNotification = z.infer<typeof opsNotificationSchema>;
