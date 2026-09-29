# Portal Horarios Frontend

Dashboard web (Next.js + TypeScript) para registrar, gestionar y consultar
horarios, modalidad y disponibilidad del equipo de líderes y practicantes de
Hispacontact. Consume la API de [`Portal-Horarios-Backend`](../Portal-Horarios-Backend)
(FastAPI + MongoDB), repo hermano de este proyecto.

## Estado actual

Este repo contiene el **esqueleto base**: la estructura de carpetas/archivos de
`src/` con páginas y componentes en forma de stub (placeholders, sin fetch real
ni lógica de negocio todavía), lista para implementarse dominio por dominio.
Los dominios reflejan lo que el backend expone hoy:

- **Auth** — login/logout por sesión.
- **Empleados** — directorio (alta, consulta, edición, cambio de estado).
- **Áreas** y **Estados** — catálogos (alta, edición, habilitar/deshabilitar).
- **Usuarios** — alta de cuentas del portal (`junta_directiva` / `lider`).
- **Auditoría** — historial de cambios sobre las entidades anteriores.
- **Horarios** — placeholder reservado; el backend todavía no implementa esta
  feature (es el objetivo final del producto, ver `AGENTS.md` del backend).

## Stack

- [Next.js](https://nextjs.org/) 14 (App Router)
- TypeScript
- Tailwind CSS
- `fetch` nativo + hooks propios por dominio (sin librerías de estado/datos remotos)

## Instalación

```bash
npm install
cp .env.local.example .env.local   # ver variables de entorno abajo
```

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | URL base del backend FastAPI | `http://localhost:8000` |

> No existe `.env.local.example` todavía — crear `.env.local` a mano con la
> variable de arriba hasta que se agregue el archivo de ejemplo.

## Ejecutar

```bash
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # build de producción
npm run start    # sirve el build de producción
npm run lint     # linting con eslint-config-next
```

## Estructura

```
src/
├── middleware.ts                # protege rutas del dashboard según cookie de sesión
├── app/
│   ├── layout.tsx                 # shell raíz, envuelve en AuthProvider
│   ├── page.tsx                    # "/" — redirige a /login
│   ├── (auth)/
│   │   └── login/page.tsx            # "/login"
│   └── (dashboard)/
│       ├── layout.tsx                # shell protegido (sidebar + topbar)
│       ├── dashboard/page.tsx          # "/dashboard" — overview
│       ├── empleados/                  # "/empleados", "/empleados/nuevo", "/empleados/:id"
│       ├── areas/page.tsx              # "/areas"
│       ├── estados/page.tsx            # "/estados" (mapea a /statuses del backend)
│       ├── usuarios/                   # "/usuarios", "/usuarios/nuevo"
│       ├── auditoria/page.tsx          # "/auditoria"
│       └── horarios/page.tsx           # "/horarios" — placeholder feature futura
├── components/
│   ├── ui/                       # primitivas (Button, Input, Select, Card, Table, Badge, Modal, Spinner)
│   ├── layout/                   # Sidebar, Topbar, DashboardShell
│   └── <dominio>/                # componentes por dominio (auth, employees, areas, statuses, users, history, schedules)
├── lib/
│   ├── api/                      # fetch wrappers por dominio + client.ts (base fetch, auth header, errores)
│   ├── hooks/                    # hooks por dominio (useEmployees, useAreas, useStatuses, useUsers, useHistory, useAuth, useSchedules)
│   └── utils/                    # cn.ts, date.ts, constants.ts
├── context/
│   └── AuthContext.tsx            # estado de sesión (token, login, logout)
└── types/                        # tipos por entidad, alineados a los esquemas del backend
```

## Modelo de autenticación

El backend usa un **token de sesión opaco** (no JWT), devuelto por
`POST /auth/login` como `{ session_token }`. El frontend lo guarda en una
cookie legible por JS y lo envía como `Authorization: Bearer <token>` en cada
llamada directa al backend (`lib/api/client.ts`). `src/middleware.ts` solo
verifica que la cookie exista para proteger `(dashboard)`; no valida el token
contra el backend.

## Pendientes conocidos del lado del backend

Estos puntos limitan lo que el frontend puede implementar hoy y están
documentados como `// TODO` en el código correspondiente:

- **No existe `GET /auth/me`**: tras hacer login no hay forma de obtener el
  nombre/rol del usuario autenticado. `AuthContext.user` queda en `null`.
- **No existe `GET /users`**: la página `/usuarios` no puede listar cuentas
  todavía, solo dar de alta (`/usuarios/nuevo`).
- **Sin endpoints de "horarios"**: la feature central del producto no está
  implementada en el backend; `/horarios` es solo un placeholder.
- **Sin CORS configurado** en el backend: hay que agregarlo ahí para que el
  navegador pueda llamar a la API desde este frontend en otro origen.

## Convenciones

Heredadas de `AGENTS.md` del backend: identificadores de código (archivos,
funciones, tipos) en inglés; rutas URL y copy visible en español. Antes de
tocar código, revisar la spec activa en `specs/` del backend si el cambio
depende de un endpoint nuevo o modificado.
