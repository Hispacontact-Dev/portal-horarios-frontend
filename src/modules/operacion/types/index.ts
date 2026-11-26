// Tipos del módulo. Reflejan el contrato del backend, no la UI.
//
// Esta es la interfaz pública de la capa: desde afuera se importa `@ops/types` y nunca un archivo
// interno (T-003). Dentro del módulo es al revés: se importa el archivo concreto por ruta relativa.
//
// Convención: el esquema de `zod` es la fuente de verdad y el tipo se deriva con `z.infer`, así no
// hay dos definiciones del mismo contrato que puedan desincronizarse.
//
// Los re-exports van nombrados uno por uno, y los tipos separados de los valores: `export *`
// esconde qué expone la capa, e `isolatedModules` exige marcar los tipos como tales.

export {
  auditFieldsSchema,
  isoDateSchema,
  slotMinutesSchema,
  slotSchema,
  timeOfDaySchema,
  timeRangeSchema,
  weekdaySchema,
} from "./primitives";
export type {
  AuditFields,
  IsoDate,
  Slot,
  SlotMinutes,
  TimeOfDay,
  TimeRange,
  Weekday,
} from "./primitives";

export { campaignCreateSchema, campaignSchema, campaignUpdateSchema } from "./campaign";
export type { Campaign, CampaignCreate, CampaignUpdate } from "./campaign";

export { activityCreateSchema, activitySchema, activityUpdateSchema } from "./activity";
export type { Activity, ActivityCreate, ActivityUpdate } from "./activity";

export {
  absenceStatusCreateSchema,
  absenceStatusSchema,
  absenceStatusUpdateSchema,
} from "./absenceStatus";
export type { AbsenceStatus, AbsenceStatusCreate, AbsenceStatusUpdate } from "./absenceStatus";

export {
  agentBulkResultSchema,
  agentBulkRowSchema,
  agentBulkSkippedSchema,
  agentCreateSchema,
  agentFiltersSchema,
  agentSchema,
  agentStatusSchema,
  agentUpdateSchema,
} from "./agent";
export type {
  Agent,
  AgentBulkResult,
  AgentBulkRow,
  AgentBulkSkipped,
  AgentCreate,
  AgentFilters,
  AgentStatus,
  AgentUpdate,
} from "./agent";

export {
  shiftAssignmentInputSchema,
  shiftAssignmentResultSchema,
  shiftAssignmentSkippedSchema,
  shiftSchema,
  shiftTemplateCreateSchema,
  shiftTemplateSchema,
} from "./shift";
export type {
  Shift,
  ShiftAssignmentInput,
  ShiftAssignmentResult,
  ShiftAssignmentSkipped,
  ShiftTemplate,
  ShiftTemplateCreate,
  ShiftTemplateUpdate,
} from "./shift";

export { restAssignmentInputSchema, restSchema, restsByDaySchema } from "./rest";
export type { Rest, RestAssignmentInput, RestsByDay } from "./rest";

export {
  agentWeekProgramSchema,
  dayProgramSaveInputSchema,
  dayProgramSchema,
  programCellContentSchema,
  programCellSchema,
  programFiltersSchema,
  programSegmentSchema,
  weekProgramSchema,
} from "./program";
export type {
  AbsenceCell,
  ActivityCell,
  AgentWeekProgram,
  DayProgram,
  DayProgramSaveInput,
  ProgramCell,
  ProgramCellContent,
  ProgramFilters,
  ProgramSegment,
  WeekProgram,
} from "./program";

export { publishInputSchema, weekPublicationSchema, weekPublicationStateSchema } from "./publication";
export type { PublishInput, WeekPublication, WeekPublicationState } from "./publication";

export {
  coverageCountsByHourSchema,
  coverageFiltersSchema,
  coverageRowSchema,
  coverageTableSchema,
} from "./coverage";
export type {
  CoverageCountsByHour,
  CoverageFilters,
  CoverageRow,
  CoverageTable,
} from "./coverage";

export {
  opsChangeRecordSchema,
  opsEntityTypeSchema,
  opsHistoryChangeSchema,
  opsHistoryFiltersSchema,
} from "./history";
export type {
  OpsChangeRecord,
  OpsEntityType,
  OpsHistoryChange,
  OpsHistoryFilters,
} from "./history";

export { opsNotificationSchema } from "./notification";
export type { OpsNotification } from "./notification";

export { isAbsenceCell, isActivityCell, isPublished } from "./guards";
