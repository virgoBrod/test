# pdf-export Specification

## Purpose

Exportación de resultados de tests a PDF para compartir o archivar.

## Requirements

### Requirement: PDF Generation

The system SHALL generate a PDF document containing: test collection name, execution date/time, pass/fail summary, list of requests with status codes, and response summaries.

- GIVEN the user clicks "Export PDF" on a test card
- WHEN the generation starts
- THEN the system SHALL compile execution results into a formatted PDF document
- AND SHALL trigger browser download with filename `{collection-name}-{date}.pdf`

### Requirement: PDF Content

The PDF MUST contain: header with collection name and date, summary section (total/passed/failed), request table (name, method, status, duration, assertions), and footer with generation timestamp.

- GIVEN a PDF is generated for execution ID 123
- WHEN the PDF opens
- THEN it SHALL display:
  - Header: "{Collection Name} - Test Report"
  - Summary: "Total: X | Passed: Y | Failed: Z"
  - Table: Request Name | Method | Status | Duration | Result
  - Footer: "Generated on {timestamp}"

### Requirement: PDF Styling

The PDF SHALL use clean, professional styling with company branding.
Passed items: green text/checkmark. Failed items: red text/X mark.

- GIVEN the PDF is rendered
- WHEN the user views it
- THEN passed requests SHALL display green checkmark
- AND failed requests SHALL display red X
- AND the layout SHALL be clean and readable

## PDF Library

Recommended: `jspdf` with `jspdf-autotable` for table formatting.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/executions/{id}` | Returns full execution with results for PDF generation |
