# test-metrics-overview Specification

## Purpose

Dashboard Overview que muestra métricas agregadas de ejecuciones de tests: total ejecutados, pasasteados, fallidos, gráfica de tendencias, y actividad reciente.

## Requirements

### Requirement: Metrics Summary Cards

The system SHALL display 4 metric cards: Total Tests, Passed, Failed, y Pass Rate (%).
Each card MUST show the aggregate count from all executions in the database.

- GIVEN the user navigates to the Overview page
- WHEN the page loads
- THEN the system SHALL query the executions table and display: total count, passed count, failed count, and calculated pass rate percentage

### Requirement: Trend Chart

The system SHALL render a line chart with 3 lines: Passed (green), Failed (red), Total (gray).
X-axis = execution timestamp (grouped by day), Y-axis = count of executions.

- GIVEN executions exist in the database
- WHEN the Overview page loads
- THEN the system SHALL query executions grouped by date and render a 3-line chart

### Requirement: Recent Activity

The system SHALL display the 5 most recent executions with: collection name, status badge, timestamp, and duration.
Each entry MUST be clickable and link to the execution detail page.

- GIVEN the user is on the Overview page
- WHEN the page loads
- THEN the system SHALL fetch the 5 most recent executions and display them as a list
- AND each entry SHALL be a link to `/history/{id}`

## Data Model

```sql
-- New table for aggregated metrics (optional caching)
CREATE TABLE IF NOT EXISTS daily_metrics (
  date TEXT PRIMARY KEY,
  total INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0
);
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/metrics/summary` | Returns { total, passed, failed, passRate } |
| GET | `/api/metrics/trend?days=30` | Returns array of { date, total, passed, failed } |
