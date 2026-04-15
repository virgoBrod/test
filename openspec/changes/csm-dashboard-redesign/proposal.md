# Proposal: CSM Dashboard Redesign

## Intent

Transformar el dashboard actual ( Newman runner básico) en un **portal de operaciones** para CSM/Soporte Técnico que permita ejecutar tests automatizados (API via Newman, UI via Playwright), visualizar métricas de calidad, y realizar tareas de soporte como forzar cierres de sesión. El sistema debe soportar múltiples proyectos (LV, Medellín, Movilidad Medellín, SALES) con la misma app móvil y web.

## Scope

### In Scope
- **Overview**: Métricas de tests (total/ejecutados/pasados/fallidos), gráfica tiempo vs tests con 3 líneas (verde=pasados, rojo=fallidos, gris=total), actividad reciente (últimos 5)
- **Apps**: Catálogo de tests con tabs Mobile/Web, ejecución con un click, exportación PDF de resultados
- **CSM Tools**: Herramienta de forzar cierre de sesión por usuario
- **Project Selector**: Dropdown para elegir proyecto (LV, Medellín, Movilidad Medellín, SALES) antes de ejecutar tests
- **Arquitectura de datos**: SQLite para historial de ejecuciones, credenciales por proyecto

### Out of Scope
- Ejecución de tests Playwright (infraestructura existe en apps/web pero no se integra al dashboard)
- Tests unitarios del dashboard
- Autenticación del propio dashboard (asumimos acceso controlado)

## Capabilities

### New Capabilities
- `test-metrics-overview`: Dashboard de métricas con gráfica de tendencias y resumen de ejecuciones
- `test-catalog`: Catálogo ejecutable de tests organizados por tipo (Mobile/Web)
- `project-selector`: Selector de proyecto que configura el ambiente y credenciales
- `csm-force-logout`: Herramienta CSM para forzar cierre de sesión de un usuario
- `pdf-export`: Exportación de resultados de test a PDF

### Modified Capabilities
- Ninguno (es un rediseño desde cero del dashboard)

## Approach

### Arquitectura
- **Layout**: Mantener App Router pattern, crear layout con sidebar navigation (Overview, Apps, CSM Tools)
- **Data Layer**: Extender SQLite con tablas para `projects`, `credentials_per_project`, `test_summaries` (agregados para métricas)
- **API Layer**: Nuevos endpoints para métricas agregadas, forzar logout, y listar projects
- **UI Layer**: Componentes reutilizables con Tailwind v4, gráfica con librería liviana (Recharts o similar)

### Selector de Proyecto
- Guardar credenciales por proyecto en SQLite (tabla `credentials`)
- El selector vive en el header/global state
- Cada collection de Newman tendrá env vars configuradas por proyecto

### Métricas (Overview)
- Query agregada sobre `executions`: COUNT, SUM(passed), SUM(failed) group by date
- Gráfica de líneas: eje X = tiempo, eje Y = cantidad de tests
- Recent activity: últimos 5 executions con status

### CSM Force Logout
- Endpoint POST `/api/csm/force-logout` que llama al backend real
- Input: user identifier (callsign o userId)
- Requiere conocer el BASE_URL del proyecto seleccionado

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/dashboard/app/page.tsx` | Modified | Rediseño a Overview con métricas y tabs |
| `apps/dashboard/app/layout.tsx` | Modified | Agregar sidebar navigation |
| `apps/dashboard/app/apps/page.tsx` | New | Catálogo de tests con tabs Mobile/Web |
| `apps/dashboard/app/csm-tools/page.tsx` | New | Herramientas CSM |
| `apps/dashboard/app/api/projects/route.ts` | New | CRUD de projects y credenciales |
| `apps/dashboard/app/api/metrics/route.ts` | New | Agregados de métricas para overview |
| `apps/dashboard/app/api/csm/force-logout/route.ts` | New | Endpoint forzar logout |
| `apps/dashboard/app/api/executions/route.ts` | Modified | Agregar project_id a executions |
| `apps/dashboard/lib/db.ts` | Modified | Nuevas tablas: projects, credentials |
| `apps/dashboard/lib/collections.ts` | Modified | Soporte para project context |
| `apps/dashboard/components/` | New/Modified | Gráfica, ProjectSelector, TestCard, etc. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking changes en Next.js 16 | Medium | Leer docs de Next.js antes de escribir código |
| Migración de esquema SQLite | Medium | BACKUP de data/ antes de migración, backwards compatible |
| Integración Playwright no existe | Low | Scope reducido a Newman inicialmente |
| Credenciales en SQLite | High | Encriptar o usar environment vars, no guardar passwords en texto plano |

## Rollback Plan

1. Revertir cambios en `lib/db.ts` y migraciones de schema
2. Restaurar `app/page.tsx` y componentes desde git
3. Eliminar nuevas tablas de SQLite (DROP TABLE IF EXISTS)
4. No hay impact en apps/backend ni apps/web

## Dependencies

- Newman sigue siendo el runner de API tests
- LibSQL para persistencia (ya en uso)
- Librería de charting (pendiente elegir: Recharts, Chart.js, o similar)
- Librería PDF (pendiente elegir: jsPDF, react-pdf, o similar)

## Success Criteria

- [ ] Overview muestra métricas correctnessas de ejecuciones históricas
- [ ] Gráfica de 3 líneas renderiza correctamente con datos reales
- [ ] Tabs Mobile/Web separan las collections correctamente
- [ ] Selector de proyecto persiste credenciales y las usa al ejecutar
- [ ] PDF export genera documento legible con resultados
- [ ] Force logout ejecuta request correctamente al backend del proyecto
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] ESLint pasa sin errores (`pnpm lint`)
