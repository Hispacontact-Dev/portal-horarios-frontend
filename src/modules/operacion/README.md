# Módulo de operación (horarios de agentes)

Todo el producto nuevo de Planeación vive acá. Hoy lo único construido es el **modelo de datos**
(`types/`, T-004): el backend todavía no expone los endpoints de las ocho sub-pestañas (C-01, C-02 y
C-04 de `backlog/CONVENCIONES-T001.md` §4), así que las rutas siguen mostrando el estado real con
`OpsSectionPlaceholder`, sin datos simulados.

Las rutas son la única pieza que no puede vivir en esta carpeta: App Router las exige en
`src/app/(ops)/operacion/`. Esos `page.tsx` son cáscaras de una línea que importan la vista
desde `@ops/pages`.

## Mapa de carpetas

| Carpeta | Qué va | Qué NO va |
|---|---|---|
| `api/` | Wrappers de los endpoints del módulo | `fetch` suelto: todo pasa por `apiFetch` de `@/lib/api/client` |
| `components/` | Componentes del módulo (`layout/` es su chasis visual) | Vistas de página completas → `pages/` |
| `engine/` | Lógica pura y derivada: cobertura por hora, cálculo de franjas | Nada que toque React o `fetch` |
| `hooks/` | Hooks del módulo, sobre `useAsyncResource` / `useAsyncAction` | Estado global |
| `pages/` | Vistas de página, una por sub-pestaña | `export default` de ruta (eso es de `src/app/`) |
| `store/` | Reducers del módulo con `useReducer` (p. ej. el borrador de la grilla) | Redux, Zustand, Jotai: **ninguna librería de estado** (AGENTS.md) |
| `types/` | Esquemas de `zod` + el tipo derivado de cada uno; reflejan el contrato del backend | Tipos moldeados para que la UI compile; un tipo declarado aparte de su esquema |
| `utils/` | Utilidades puras (rutas del módulo, feature flag, formato) | Lógica de cobertura → `engine/` |

## Interfaz pública: los barriles por capa

Desde afuera se importa **solo** el barril de la capa: `@ops/components`, `@ops/pages`,
`@ops/utils`, `@ops/types`, y los que se vayan llenando (`@ops/api`, `@ops/hooks`, `@ops/engine`,
`@ops/store`). Nombrar un archivo interno (`@ops/utils/sections`) es error de lint. Dentro del
módulo es al revés: se importa el archivo concreto por ruta relativa, no el barril de la propia
capa.

**No hay barril raíz (`@ops`) a propósito:** `src/middleware.ts` importa `isOpsRoute` del
módulo, y un índice raíz que reexportara componentes cliente arrastraría React al bundle del
middleware.

## Modelo de datos (`types/`)

**El esquema es la fuente de verdad y el tipo se deriva** con `z.infer`. Un archivo por dominio, y
desde afuera solo el barril `@ops/types` (112 símbolos: 56 esquemas y sus 56 tipos). Si alguna vez
hay que declarar un tipo a mano al lado de su esquema, son dos definiciones del mismo contrato y se
van a desincronizar: no se hace.

`zod` es la única dependencia de producción que agrega el módulo (constitución §1 exige
justificarla, y la justificación está en el PR de T-004). Valida en las dos fronteras que el portal
de Junta no tiene: el cargue masivo de agentes y la grilla, donde una celda mal formada corrompe la
cobertura.

### La celda: una unión discriminada

Una franja solo puede tener dos cosas, y van discriminadas por `kind`:

```ts
{ kind: "activity", activity_id }   // suma en la cobertura
{ kind: "absence",  status_id }     // no suma nunca (brief §9)
```

El discriminante no es decoración: obliga al motor de cobertura a mirar `kind` antes de leer el id,
así que no puede contar una ausencia como si fuera trabajo. `ProgramCell.content` además admite
`null`, que es **una franja fuera del turno** — no es una ausencia, ahí no hay jornada que cubrir.

### Dos representaciones de la programación

| | Qué es | Quién la usa |
|---|---|---|
| `ProgramSegment` | `start` → `end` con un contenido | Lo que viaja al backend y lo que se edita |
| `ProgramCell` | una por franja | Lo que pinta la grilla |

La conversión entre las dos es lógica pura y vive en `engine/`.

### Lo que NO se almacena

Todo lo derivable se calcula en `engine/`, nunca se guarda: la **duración** de la jornada (sale de
`start`/`end`), las **horas del día** y el **acumulado semanal** (salen de los segmentos) y la
**cobertura** (sale de `WeekProgram`). Guardar un derivado al lado de su origen son dos fuentes de
verdad que terminan contradiciéndose.

### Primitivos propios, a propósito

`Weekday`, `TimeRange` y las horas se redeclaran en `primitives.ts` en vez de reutilizar
`@/types/schedule`: la frontera solo admite `@/types/session`, y T-001 §2.2 reserva `Schedule` y
`Employee` al portal de Junta. Los formatos sí se copian literal del backend — `"YYYY-MM-DD"` y
`"HH:MM"` con el regex de `TIME_PATTERN` — porque son el contrato.

### Decisiones abiertas marcadas en el código

Ningún endpoint del módulo existe todavía (C-02), así que estos tipos son la **propuesta de contrato
del frontend**, no un contrato acordado. Cada decisión abierta quedó anotada donde afecta:

| | Dónde | Qué se asumió provisionalmente |
|---|---|---|
| C-01 | `program.ts` | La escritura es por agente-día en lote, que es lo que el backend ya versiona |
| C-04 | `history.ts` | La entidad más fina es `day_program`, no la celda (un registro por celda infla el historial) |
| C-05 | `absenceStatus.ts` | El módulo declara su propio estado de ausencia y no importa `@/types/status` |
| C-07 | `publication.ts` | Se publica por campaña+semana. Despublicar **no** se modela |
| C-10 | `campaign.ts` | El rango operativo y `slot_minutes` son dato de la campaña, sin cerrar qué valores admite |
| C-12 | `agent.ts` | Las columnas del cargue masivo son los campos de alta; cada fila lleva `row_number` |
| C-13 | `notification.ts` | Forma mínima, sin canal ni evento |
| C-14 | `agent.ts` | Está `weekly_contracted_hours`; la alerta de desvío no se asume |

## Frontera

Dos direcciones, las dos verificadas por `npm run lint` (`no-restricted-imports` en
`.eslintrc.json`, regla del core de ESLint: sin dependencias nuevas):

1. **Nadie de afuera entra.** Ningún archivo del portal de Junta Directiva puede importar
   `@ops/*` ni `@/modules/*`. Las únicas excepciones son `src/app/(ops)/**` y
   `src/middleware.ts`, y solo por los barriles.
2. **El módulo solo consume el chasis por los adaptadores de T-000 §3.1/§3.2.** Lo
   permitido, y nada más:

   - `@/lib/api/client`, `@/lib/api/errors`
   - `@/lib/hooks/useAsyncResource`, `useAsyncAction`, `useAuth`, `useToast`,
     `useSuccessFlag`, `useNowTick`, `useDismissibleNotice`
   - `@/components/ui/**`, `@/components/layout/**`
   - `@/lib/utils/cn`, `week`, `time`, `date`, `csv`, `constants`, `role`
   - `@/types/session`

   Queda bloqueado el **dominio** del portal de Junta: `@/lib/api/employees`,
   `@/types/employee`, `@/lib/utils/scheduleStatus`, `@/components/dashboard/**`,
   `@/context/**`, `@/lib/session/**` y compañía. Si hace falta una pieza de esas, se
   envuelve con un adaptador propio dentro del módulo y se agrega acá y en `.eslintrc.json`
   en el mismo PR — nunca se abre la regla sin dejarlo escrito.

Para comprobar que la frontera sigue viva: agregá un import prohibido, corré `npm run lint`
y mirá que falle. Es el criterio de "hecho" de T-003.

## Divergencia declarada con T-001

`backlog/CONVENCIONES-T001.md` §1.1 proponía repartir el módulo por capas en las carpetas
existentes (`src/lib/api/ops/`, `src/components/ops/`, `src/lib/utils/ops/`…). T-003 lo
reemplazó por este módulo único, que es lo que permite expresar la frontera como una sola
zona de lint. El documento de T-001 queda como histórico; **la convención vigente sobre
dónde vive el código del módulo es este README.** El resto de T-001 (vocabulario único
ACTIVIDAD, nomenclatura, definición de "terminado") sigue en pie sin cambios.
