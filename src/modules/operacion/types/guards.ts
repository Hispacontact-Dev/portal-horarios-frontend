// Estrechamientos sobre los tipos del módulo. Son los que consume el motor de cobertura: el
// discriminante `kind` ya obliga a mirar antes de leer, y estos guards le ponen nombre a esa
// pregunta para que la regla del brief §9 se lea en una línea.

import type { AbsenceCell, ActivityCell, ProgramCellContent } from "./program";
import type { WeekPublicationState } from "./publication";

export function isActivityCell(content: ProgramCellContent): content is ActivityCell {
  return content.kind === "activity";
}

export function isAbsenceCell(content: ProgramCellContent): content is AbsenceCell {
  return content.kind === "absence";
}

// Acepta cualquier cosa que lleve el estado de la semana: sirve igual para `WeekPublication` y para
// `WeekProgram`, que son los dos lugares desde donde hay que preguntarlo.
export function isPublished(week: { state: WeekPublicationState }): boolean {
  return week.state === "published";
}
