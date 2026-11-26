// Campañas: el catálogo del que cuelga todo lo demás del módulo. Sin campaña no hay filtro, y sin
// filtro ninguna sub-pestaña puede pedir datos.
//
// Contrato: `backlog/ANEXO-A-T005-CONTRATO-API.md` §4. Ninguno de estos endpoints existe todavía
// en el backend (C-02), así que hoy responden 404 y la pantalla muestra ese estado real.

import { z } from "zod";

import { campaignSchema, type Campaign, type CampaignCreate, type CampaignUpdate } from "../types/campaign";
import { opsFetch } from "./client";

const DUPLICATE_NAME_MESSAGE = "Ya existe una campaña con ese nombre";

export async function listCampaigns(signal?: AbortSignal): Promise<Campaign[]> {
  return opsFetch("/campanas", z.array(campaignSchema), { signal });
}

export async function createCampaign(input: CampaignCreate): Promise<Campaign> {
  return opsFetch("/campanas", campaignSchema, {
    method: "POST",
    body: input,
    errorCopy: { 409: DUPLICATE_NAME_MESSAGE },
  });
}

export async function updateCampaign(campaignId: string, input: CampaignUpdate): Promise<Campaign> {
  return opsFetch(`/campanas/${campaignId}`, campaignSchema, {
    method: "PUT",
    body: input,
    errorCopy: { 409: DUPLICATE_NAME_MESSAGE },
  });
}
