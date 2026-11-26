// Actividades por campaña (brief §5). El concepto único del producto: lo que el agente está
// haciendo en cada franja.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. Las actividades cuelgan de la campaña en la
// ruta porque es su dueña: no hay actividad sin campaña.

import { z } from "zod";

import { activitySchema, type Activity, type ActivityCreate, type ActivityUpdate } from "../types/activity";
import { opsFetch } from "./client";

const DUPLICATE_NAME_MESSAGE = "Ya existe una actividad con ese nombre en la campaña";

export async function listActivities(campaignId: string, signal?: AbortSignal): Promise<Activity[]> {
  return opsFetch(`/campanas/${campaignId}/actividades`, z.array(activitySchema), { signal });
}

// La campaña sale del propio input en vez de viajar como parámetro aparte: `ActivityCreate` ya la
// trae, y dos fuentes del mismo id se contradicen tarde o temprano.
export async function createActivity(input: ActivityCreate): Promise<Activity> {
  return opsFetch(`/campanas/${input.campaign_id}/actividades`, activitySchema, {
    method: "POST",
    body: input,
    errorCopy: { 409: DUPLICATE_NAME_MESSAGE },
  });
}

// `ActivityUpdate` no admite `campaign_id` (ver `types/activity.ts`): mover una actividad de
// campaña dejaría huérfanas las celdas ya programadas con ella.
export async function updateActivity(
  campaignId: string,
  activityId: string,
  input: ActivityUpdate,
): Promise<Activity> {
  return opsFetch(`/campanas/${campaignId}/actividades/${activityId}`, activitySchema, {
    method: "PUT",
    body: input,
    errorCopy: { 409: DUPLICATE_NAME_MESSAGE },
  });
}
