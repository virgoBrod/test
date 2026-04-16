# csm-force-logout Specification

## Purpose

Herramienta CSM para forzar el cierre de sesión de un usuario específico en un proyecto dado. El token CSM por proyecto se almacena encriptado y nunca se expone al cliente.

## Security Model

- CSM tokens son secretos por proyecto, nunca salen del servidor
- Tokens almacenados encriptados con AES-256-GCM en `credentials.encrypted_data`
- Encryption key derivada de `BULLSEC_ENCRYPTION_KEY` (env var, 32 bytes)
- El cliente solo recibe el mensaje de éxito/error, nunca el token

## Requirements

### Requirement: Force Logout Form

The system SHALL display a form with: project selector (pre-filled with current project), email input field, and submit button.
The form SHALL validate that email is not empty and contains "@" before submission.

- GIVEN the user navigates to CSM Tools page
- WHEN the page loads
- THEN the system SHALL display a form with project dropdown (pre-selected), email input, and "Force Logout" button
- AND the button SHALL be disabled until a valid email is entered

### Requirement: Force Logout API Call

The system SHALL call the project's `/api/logout_force` endpoint with the CSM token.
The token MUST be fetched from `credentials.encrypted_data`, decrypted server-side, and sent as Bearer token.

- GIVEN the user fills the form and clicks "Force Logout"
- WHEN the form is submitted
- THEN the system SHALL send POST to `/api/csm/force-logout` with { project_id, user_identifier }
- AND the API SHALL fetch and decrypt credentials for that project
- AND the API SHALL forward the request to `{base_url_mobile}/api/logout_force` with:
  - Header: `Authorization: Bearer {csmToken}`
  - Body: `{ "email": user_identifier }`

### Requirement: Credentials Storage

Each project stores its CSM token in `credentials.encrypted_data` as JSON: `{ "csmToken": "..." }`.
Credentials MUST be stored before first use of force logout.

- GIVEN the admin configures credentials for a project
- WHEN credentials are saved
- THEN the csmToken SHALL be stored encrypted in the database
- AND the raw token SHALL NOT appear in logs, responses, or client-side code

### Requirement: Success/Error Feedback

The system SHALL display a success or error message after the operation.
Success shows message from API response. Error shows descriptive message.

- GIVEN the force logout request completes
- WHEN the response is 200
- THEN the system SHALL show success with message from API
- WHEN the response is error
- THEN the system SHALL show error toast with the reason from API

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/csm/force-logout` | Body: { project_id, user_identifier } — internal endpoint |
| POST | `/{base_url_mobile}/api/logout_force` | External API — Body: { email }, Header: Authorization: Bearer {csmToken} |

## Data Model

```typescript
// Stored encrypted in credentials.encrypted_data per project
interface CsmCredentials {
  csmToken: string;
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BULLSEC_ENCRYPTION_KEY` | 32-byte base64-encoded key for AES-256-GCM encryption |

## CSM Tool Component

```typescript
interface ForceLogoutFormProps {
  selectedProject: Project;
  onSuccess: () => void;
  onError: (message: string) => void;
}
```
