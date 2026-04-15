# csm-force-logout Specification

## Purpose

Herramienta CSM para forzar el cierre de sesión de un usuario específico en un proyecto dado.

## Requirements

### Requirement: Force Logout Form

The system SHALL display a form with: project selector (pre-filled with current project), user identifier input (callsign or user ID), and submit button.
The form SHALL validate that user identifier is not empty before submission.

- GIVEN the user navigates to CSM Tools page
- WHEN the page loads
- THEN the system SHALL display a form with project dropdown (pre-selected), user identifier input, and "Force Logout" button
- AND the button SHALL be disabled until user identifier is entered

### Requirement: Force Logout API Call

The system SHALL call the backend API to invalidate the user's session.
The call MUST use the base URL from the selected project.

- GIVEN the user fills the form and clicks "Force Logout"
- WHEN the form is submitted
- THEN the system SHALL send POST to `/api/csm/force-logout` with { project_id, user_identifier }
- AND the API SHALL forward the request to the project's auth endpoint

### Requirement: Success/Error Feedback

The system SHALL display a success or error message after the operation.
Success: "Sesión cerrada exitosamente". Error: "Error al cerrar sesión: {reason}".

- GIVEN the force logout request completes
- WHEN the response is 200
- THEN the system SHALL show success toast: "Sesión cerrada exitosamente"
- WHEN the response is error
- THEN the system SHALL show error toast with the reason

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/csm/force-logout` | Body: { project_id, user_identifier } |

## CSM Tool Component

```typescript
interface ForceLogoutFormProps {
  selectedProject: Project;
  onSuccess: () => void;
  onError: (message: string) => void;
}
```
