// Calendario fijo de feriados nacionales de Colombia — excepción documentada a la regla de no-hardcodear
// datos de negocio (docs/constitution.md punto 5; specs/005-horarios/spec.md RF-5, RNF-3). Traslados al
// lunes siguiente según la Ley 51 de 1983 ("Ley Emiliani"). Verificado para 2026-2027 en octubre de 2026;
// requiere actualizarse cada año.

const COLOMBIA_HOLIDAYS: Record<string, string> = {
  "2026-01-01": "Año Nuevo",
  "2026-01-12": "Reyes Magos",
  "2026-03-23": "San José",
  "2026-04-02": "Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajo",
  "2026-05-18": "Ascensión de Jesús",
  "2026-06-08": "Corpus Christi",
  "2026-06-15": "Sagrado Corazón",
  "2026-06-29": "San Pedro y San Pablo",
  "2026-07-13": "Nuestra Señora del Rosario de Chiquinquirá",
  "2026-07-20": "Independencia de Colombia",
  "2026-08-07": "Batalla de Boyacá",
  "2026-08-17": "Asunción de la Virgen",
  "2026-10-12": "Día de la Raza",
  "2026-11-02": "Todos los Santos",
  "2026-11-16": "Independencia de Cartagena",
  "2026-12-08": "Inmaculada Concepción",
  "2026-12-25": "Navidad",
  "2027-01-01": "Año Nuevo",
  "2027-01-11": "Reyes Magos",
  "2027-03-22": "Día de San José",
  "2027-03-25": "Jueves Santo",
  "2027-03-26": "Viernes Santo",
  "2027-05-01": "Día del Trabajo",
  "2027-05-10": "Ascensión de Jesús",
  "2027-05-31": "Corpus Christi",
  "2027-06-07": "Sagrado Corazón de Jesús",
  "2027-07-05": "San Pedro y San Pablo",
  "2027-07-20": "Día de la Independencia",
  "2027-08-07": "Batalla de Boyacá",
  "2027-08-16": "Asunción de la Virgen",
  "2027-10-18": "Día de la Raza",
  "2027-11-01": "Todos los Santos",
  "2027-11-15": "Independencia de Cartagena",
  "2027-12-08": "Inmaculada Concepción",
  "2027-12-25": "Navidad",
};

export function isHoliday(date: string): boolean {
  return date in COLOMBIA_HOLIDAYS;
}

export function holidayName(date: string): string | null {
  return COLOMBIA_HOLIDAYS[date] ?? null;
}
