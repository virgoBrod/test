# Tasks: CSM Dashboard Redesign

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Update `lib/db.ts`: Add `projects` and `credentials` tables, add `project_id` column to `executions`, create indexes
- [x] 1.2 Create `lib/encryption.ts`: Implement AES-256-GCM encrypt/decrypt using Web Crypto API
- [x] 1.3 Update `lib/collections.ts`: Add `type` field (mobile/web) to CollectionConfig, add project context
- [x] 1.4 Create `types/index.ts`: Shared types (Project, Credentials, MetricSummary, TrendData, etc.)

## Phase 2: Components (UI)

- [x] 2.1 Create `components/ProjectSelector.tsx`: Dropdown with 4 projects (LV, Medellín, Movilidad Medellín, SALES)
- [x] 2.2 Create `components/Sidebar.tsx`: Navigation with Overview, Apps, CSM Tools links
- [x] 2.3 Create `components/MetricCard.tsx`: Stat card with label, value, and optional trend indicator
- [x] 2.4 Create `components/TrendChart.tsx`: Recharts LineChart with 3 lines (green/red/gray)
- [x] 2.5 Create `components/RecentActivity.tsx`: List of last 5 executions with status badges
- [x] 2.6 Create `components/TestCard.tsx`: Card with Run button and Export PDF button
- [x] 2.7 Create `components/ForceLogoutForm.tsx`: Form with project prefill, user identifier input, submit button
- [x] 2.8 Create `components/Toast.tsx`: Success/error notification component

## Phase 3: API Routes

- [x] 3.1 Create `app/api/projects/route.ts`: GET all projects, POST new project
- [x] 3.2 Create `app/api/projects/[id]/credentials/route.ts`: GET/PUT credentials for a project
- [x] 3.3 Create `app/api/metrics/summary/route.ts`: GET aggregate metrics (total, passed, failed, passRate)
- [x] 3.4 Create `app/api/metrics/trend/route.ts`: GET time-series data grouped by day
- [x] 3.5 Create `app/api/csm/force-logout/route.ts`: POST force logout (placeholder endpoint)
- [x] 3.6 Update `app/api/executions/route.ts`: Add project_id filter parameter
- [x] 3.7 Update `app/api/run/route.ts`: Accept and use project context for credential lookup

## Phase 4: Pages & Layout

- [x] 4.1 Update `app/layout.tsx`: Add Sidebar, ProjectSelector in header, ProjectContext provider
- [x] 4.2 Update `app/page.tsx`: Transform to Overview with MetricCards, TrendChart, RecentActivity
- [x] 4.3 Create `app/apps/page.tsx`: Tab container (Mobile/Web) with TestCards
- [x] 4.4 Create `app/csm-tools/page.tsx`: Page with ForceLogoutForm component

## Phase 5: PDF Export

- [x] 5.1 Install `jspdf` and `jspdf-autotable` dependencies
- [x] 5.2 Create `lib/pdf.ts`: Function to generate PDF from execution results
- [x] 5.3 Update `components/TestCard.tsx`: Wire Export PDF button to pdf.ts function

## Phase 6: Testing / Verification

- [x] 6.1 Run `tsc --noEmit` to verify TypeScript types
- [x] 6.2 Run `pnpm lint` to check for linting errors
- [ ] 6.3 Visual verification: Navigate through all pages (Overview → Apps → Run test → Check history)
- [ ] 6.4 Verify project selector persists across page refresh
- [ ] 6.5 Verify credentials are saved and loaded per project

## Phase 7: Cleanup

- [ ] 7.1 Remove or deprecate old `HistoryPanel.tsx` component if no longer used
- [ ] 7.2 Update `app/globals.css`: Ensure Tailwind v4 styles work with new components
