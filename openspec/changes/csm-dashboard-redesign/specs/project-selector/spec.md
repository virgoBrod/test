# project-selector Specification

## Purpose

Selector de proyecto (LV, Medellín, Movilidad Medellín, SALES) que persiste credenciales por proyecto y las usa al ejecutar tests.

## Requirements

### Requirement: Project Selector Dropdown

The system SHALL display a project selector in the global header.
The dropdown SHALL list all configured projects: LV, Medellín, Movilidad Medellín, SALES.

- GIVEN the user is on any dashboard page
- WHEN the header renders
- THEN the system SHALL display a project dropdown with the 4 projects
- AND the currently selected project SHALL be visually indicated

### Requirement: Project Persistence

The system SHALL persist the selected project in localStorage and SQLite.
On page load, the system SHALL restore the last selected project.

- GIVEN the user selects a project
- WHEN the selection changes
- THEN the system SHALL save to localStorage and update the database
- AND on subsequent page loads, SHALL restore the last selected project

### Requirement: Credentials Per Project

The system SHALL store credentials encrypted per project in SQLite.
Credentials MUST NOT be stored in plain text.

- GIVEN the user enters credentials for a project
- WHEN the user saves
- THEN the system SHALL encrypt credentials before storing in SQLite
- AND credentials SHALL be retrieved using the selected project_id

### Requirement: Project-Aware Execution

When executing a collection, the system SHALL use the credentials associated with the currently selected project.

- GIVEN the user executes a test with project "Medellín" selected
- WHEN the execution starts
- THEN the system SHALL use credentials from the "Medellín" project row

## Data Model

```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url_mobile TEXT,
  base_url_web TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credentials (
  project_id TEXT PRIMARY KEY,
  encrypted_data TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

## Projects

| ID | Name | Base URLs |
|----|------|-----------|
| lv | LV | https://lv.broadsec.com |
| medellin | Medellín | https://medellin.broadsec.com |
| movilidad_medellin | Movilidad Medellín | https://movilidad.broadsec.com |
| sales | SALES | https://sales.broadsec.com |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | Returns all projects |
| GET | `/api/projects/{id}/credentials` | Returns decrypted credentials |
| PUT | `/api/projects/{id}/credentials` | Saves encrypted credentials |
| POST | `/api/projects` | Creates new project |
