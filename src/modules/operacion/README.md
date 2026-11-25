# Módulo de operación (horarios de agentes)

Todo el producto nuevo de Planeación vive acá. Hoy el módulo está **vacío a propósito**: el
backend todavía no expone los endpoints de las ocho sub-pestañas (C-01, C-02 y C-04 de
`backlog/CONVENCIONES-T001.md` §4), así que las rutas muestran el estado real con
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
| `types/` | Tipos del módulo; reflejan el contrato del backend | Tipos moldeados para que la UI compile |
| `utils/` | Utilidades puras (rutas del módulo, feature flag, formato) | Lógica de cobertura → `engine/` |

## Interfaz pública: los barriles por capa

Desde afuera se importa **solo** el barril de la capa: `@ops/components`, `@ops/pages`,
`@ops/utils`, y los que se vayan llenando (`@ops/api`, `@ops/hooks`, `@ops/engine`,
`@ops/store`, `@ops/types`). Nombrar un archivo interno (`@ops/utils/sections`) es error de
lint. Dentro del módulo es al revés: se importa el archivo concreto por ruta relativa, no el
barril de la propia capa.

**No hay barril raíz (`@ops`) a propósito:** `src/middleware.ts` importa `isOpsRoute` del
módulo, y un índice raíz que reexportara componentes cliente arrastraría React al bundle del
middleware.

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
