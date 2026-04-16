# test-catalog Specification

## Purpose

Catálogo de tests ejecutables organizado por tipo (Mobile Flow, Web Flow) con tabs. Permite ejecutar tests con un click y exportar resultados a PDF.

## Requirements

### Requirement: Mobile/Web Tabs

The system SHALL display two tabs: "Mobile" and "Web".
Each tab SHALL contain the relevant test collections (Auth, Mobile Flow for Mobile; Web Flow for Web).

- GIVEN the user is on the Apps page
- WHEN the page loads
- THEN the system SHALL display Mobile and Web tabs
- AND Mobile tab SHALL show collections where type = 'mobile'
- AND Web tab SHALL show collections where type = 'web'

### Requirement: Test Cards

Each collection MUST be displayed as a card with: name, description, last execution status badge, and "Run" button.
The card SHALL show "Never run" if no execution exists.

- GIVEN the user is on the Apps page
- WHEN a collection is displayed
- THEN the card SHALL show collection name, description, and last status
- AND if never executed, SHALL show "Never run" badge instead

### Requirement: Single Test Execution

The system SHALL execute a test when the user clicks "Run" on a card.
The system SHALL request credentials via modal if not stored for the current project.

- GIVEN the user clicks "Run" on a test card
- WHEN credentials exist for the selected project
- THEN the system SHALL execute the collection immediately
- WHEN credentials do NOT exist
- THEN the system SHALL show the credentials modal before execution

### Requirement: Export to PDF

Each test card SHALL have an "Export PDF" button (or icon).
PDF SHALL contain: execution summary, list of requests with status, and timestamp.

- GIVEN the user clicks "Export PDF" on a card
- WHEN the execution history exists for that collection
- THEN the system SHALL generate a PDF with test summary and request results
- AND SHALL trigger browser download

## Test Card Component

```typescript
interface TestCardProps {
  collection: CollectionConfig;
  lastExecution?: Execution | null;
  onRun: (id: CollectionId) => void;
  onExport: (id: CollectionId) => void;
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/collections` | Returns all collections with metadata |
| GET | `/api/executions?collection={id}&limit=1` | Returns last execution for a collection |
