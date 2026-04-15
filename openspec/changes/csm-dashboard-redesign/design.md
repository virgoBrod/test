# Design: CSM Dashboard Redesign

## Technical Approach

Rediseño del dashboard para ser portal de operaciones CSM con 3 secciones: Overview (métricas), Apps (catálogo ejecutable), CSM Tools (force logout). Mantiene App Router pattern de Next.js 16, extiende SQLite con tablas de projects/credentials, y añade charting con Recharts + PDF con jsPDF.

## Architecture Decisions

### Decision: Charting Library

**Choice**: Recharts
**Alternatives considered**: Chart.js, Tremor, native SVG
**Rationale**: Recharts tiene excelente soporte React, tree-shakeable, y trabaja bien con Tailwind. Tremor es más opinionado y requiere más overrides. Chart.js requiere wrapper React破不太好.

### Decision: PDF Library

**Choice**: jsPDF + jspdf-autotable
**Alternatives considered**: react-pdf, pdfmake, server-side PDF
**Rationale**: jsPDF es client-side sin dependencias server-side, autotable genera tablas facilmente, y el bundle impact es acceptable (~500KB). react-pdf tiene issues de rendering cross-browser.

### Decision: Encryption for Credentials

**Choice**: AES-256-GCM via Web Crypto API (SubtleCrypto)
**Alternatives considered**: bcrypt, server-side encryption, plain text
**Rationale**: Web Crypto API es nativo del browser, no requiere dependencias adicionales, y es suficiente para credentials at-rest. bcrypt es para passwords no encryption. Server-side complicaría el modelo offline-first.

### Decision: State Management

**Choice**: React Context + localStorage para project selection
**Alternatives considered**: Zustand, Jotai, URL params
**Rationale**: La app es simple — solo el project selector necesita estado global. Context es suficiente y no introduce otra dependencia. localStorage para persistencia sobrevive refresh.

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Layout (sidebar + header con ProjectSelector)              │
│  ┌──────────┐  ┌─────────────────────────────────────────┐ │
│  │ Sidebar  │  │ Page Content                            │ │
│  │ - Overview│  │ - /app/page.tsx (Overview)             │ │
│  │ - Apps   │  │ - /app/apps/page.tsx (Catalog)          │ │
│  │ - CSM    │  │ - /app/csm-tools/page.tsx               │ │
│  └──────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────────────────────────┐
│ ProjectContext  │  │ SQLite (LibSQL)                       │
│ - selectedProject│  │ - executions (existing)              │
│ - setProject()  │  │ - results (existing)                  │
└─────────────────┘  │ - projects (NEW)                     │
                     │ - credentials (NEW, encrypted)         │
                     └──────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/layout.tsx` | Modify | Add sidebar navigation, ProjectSelector in header, ProjectContext provider |
| `app/page.tsx` | Modify | Transform to Overview with metrics + chart + recent activity |
| `app/apps/page.tsx` | Create | Test catalog with Mobile/Web tabs |
| `app/csm-tools/page.tsx` | Create | CSM tools (force logout form) |
| `app/api/projects/route.ts` | Create | CRUD for projects |
| `app/api/projects/[id]/credentials/route.ts` | Create | Get/save encrypted credentials |
| `app/api/metrics/summary/route.ts` | Create | Aggregate metrics |
| `app/api/metrics/trend/route.ts` | Create | Time-series metrics for chart |
| `app/api/csm/force-logout/route.ts` | Create | Force logout endpoint |
| `app/api/executions/route.ts` | Modify | Add project_id filter |
| `lib/db.ts` | Modify | Add projects, credentials tables + indexes |
| `lib/collections.ts` | Modify | Add type (mobile/web) field, project context |
| `lib/encryption.ts` | Create | AES-256-GCM encrypt/decrypt for credentials |
| `components/ProjectSelector.tsx` | Create | Dropdown component |
| `components/Sidebar.tsx` | Create | Navigation sidebar |
| `components/MetricCard.tsx` | Create | Summary stat card |
| `components/TrendChart.tsx` | Create | 3-line Recharts chart |
| `components/RecentActivity.tsx` | Create | Last 5 executions list |
| `components/TestCatalog.tsx` | Create | Tab container for test cards |
| `components/TestCard.tsx` | Create | Card with Run + Export PDF |
| `components/ForceLogoutForm.tsx` | Create | CSM form component |
| `components/Toast.tsx` | Create | Success/error notifications |

## Data Model

### New Tables

```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url_mobile TEXT NOT NULL,
  base_url_web TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS credentials (
  project_id TEXT PRIMARY KEY,
  encrypted_data TEXT NOT NULL, -- encrypted JSON: { callsign, password, email, etc }
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Seed default projects
INSERT OR IGNORE INTO projects (id, name, base_url_mobile, base_url_web) VALUES
  ('lv', 'LV', 'https://lv.broadsec.com', 'https://lv.broadsec.com'),
  ('medellin', 'Medellín', 'https://medellin.broadsec.com', 'https://medellin.broadsec.com'),
  ('movilidad_medellin', 'Movilidad Medellín', 'https://movilidad.broadsec.com', 'https://movilidad.broadsec.com'),
  ('sales', 'SALES', 'https://sales.broadsec.com', 'https://sales.broadsec.com');

-- Add project_id to executions (migration-safe: nullable first)
ALTER TABLE executions ADD COLUMN project_id TEXT REFERENCES projects(id);

CREATE INDEX IF NOT EXISTS idx_executions_project ON executions(project_id);
```

**Nota**: Credentials se guardan por proyecto (un solo user a la vez por proyecto). Si varios usuarios usan el mismo dashboard, las credenciales se sobreescriben por proyecto — esto es aceptable para el caso de uso CSM donde un solo CSM usa la estación.

## API Contracts

### GET /api/metrics/summary
```typescript
Response: {
  total: number;
  passed: number;
  failed: number;
  passRate: number; // percentage
}
```

### GET /api/metrics/trend?days=30
```typescript
Response: Array<{
  date: string; // ISO date
  total: number;
  passed: number;
  failed: number;
}>
```

### POST /api/csm/force-logout
```typescript
Request: {
  project_id: string;
  user_identifier: string;
}
Response: {
  success: boolean;
  message: string;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Encryption util, date formatting | Vitest unit tests |
| Integration | API routes | Manual + browser testing |
| E2E | Full flows (Overview → Run test → Export) | Playwright (existing in apps/web) |

## Migration / Rollback

1. **Backup**: Copy `data/dashboard.db` before first run
2. **Schema migration**: `lib/db.ts` runs CREATE TABLE IF NOT EXISTS (backwards compatible)
3. **Feature flag**: None needed — new pages don't affect existing functionality
4. **Rollback**: Restore `dashboard.db` from backup, revert git checkout on modified files

## Open Questions

- [x] Force logout endpoint: placeholder `/api/csm/force-logout`, mismo para todos los backends
- [x] Credentials: por proyecto Y por usuario, pedidas al inicio
- [x] Dashboard auth: none por ahora, se agrega después

**Credential Storage Model**:
- Credentials se guardan encriptadas por `{project_id}` en `credentials` table
- El baseURL mobile/web cambia según el proyecto seleccionado
- Al cambiar de proyecto, se cargan las credenciales guardadas o se piden si no existen
