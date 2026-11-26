// Wrappers de los endpoints del módulo. Solo llaman a `apiFetch` de `lib/api/client.ts`.
//
// Esta es la interfaz pública de la capa: desde afuera se importa `@ops/api` y nunca un archivo
// interno (T-003). `client.ts`, `normalize.ts` y `query.ts` no se reexportan a propósito: son el
// cómo, no el qué, y nadie fuera de `api/` debería armar una petición a mano.
//
// El contrato que consumen estas funciones está en `backlog/ANEXO-A-T005-CONTRATO-API.md`. Los
// tipos de sus parámetros y respuestas salen de `@ops/types`, así que acá no se reexporta ninguno.
//
// Los re-exports van nombrados uno por uno y en el mismo orden que `types/index.ts`: `export *`
// esconde qué expone la capa.

export { listCampaigns, createCampaign, updateCampaign } from "./campaigns";

export { listActivities, createActivity, updateActivity } from "./activities";

export { listAbsenceStatuses, createAbsenceStatus, updateAbsenceStatus } from "./absenceStatuses";

export { listAgents, getAgent, createAgent, updateAgent, bulkCreateAgents } from "./agents";

export {
  listShiftTemplates,
  createShiftTemplate,
  updateShiftTemplate,
  assignShift,
} from "./shifts";

export { listRests, assignRests, updateRest } from "./rests";

export { getWeekProgram, saveDayProgram } from "./program";

export { getWeekPublication, publishWeek } from "./publications";

export { getCoverage } from "./coverage";

export { listOpsHistory } from "./history";

export { listOpsNotifications, markOpsNotificationRead } from "./notifications";
