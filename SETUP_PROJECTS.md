# Configuración de Proyectos y Flows

## Proyectos Disponibles

El sistema soporta múltiples proyectos con flows de test separados. Actualmente:

1. **sales** - SALES/DEMO ✅
   - Mobile: https://mb.inovisec.com
   - Web: https://web.inovisec.com
   - Flows: auth, mobile-flow, web-flow

> **Note**: La infraestructura para múltiples proyectos está lista. Para agregar un nuevo proyecto, creá las colecciones y environments correspondientes.

## Cómo Agregar Flows a un Proyecto

### Backend (Newman)

1. Copiá las colecciones de Postman en:
   ```
   apps/backend/collections/<project_id>/
   ```

2. Actualizá las variables de entorno en:
   ```
   apps/backend/environments/projects/<project_id>.postman_environment.json
   apps/backend/environments/projects/web.<project_id>.postman_environment.json
   ```

3. Probá con:
   ```bash
   node run-flow.js --project <project_id> --flow auth --type mobile
   ```

### Mobile (Maestro)

1. Creá los flows YAML en:
   ```
   apps/mobile/flows/<project_id>/
   ```

2. Usá variables de entorno para credenciales:
   ```yaml
   appId: com.inovisec.broadsecmobileapp
   
   ---
   - tapOn: "Username"
   - inputText: ${MOBILE_USER_CALLSIGN}
   ```

### Web (Playwright)

1. Creá los tests en:
   ```
   apps/web/tests/<project_id>/e2e/
   ```

2. Configurá el base URL en `playwright.config.ts`:
   ```ts
   use: {
     baseURL: process.env.WEB_BASE_URL || 'https://default.com'
   }
   ```

## Dashboard

El dashboard detecta automáticamente los flows disponibles para cada proyecto:

- `GET /api/flows?project=<project_id>` - Lista flows disponibles
- El selector de proyectos arriba a la derecha cambia el contexto
- Los tests se ejecutan con las URLs y credenciales del proyecto seleccionado

## Credenciales

Las credenciales se guardan encriptadas por proyecto en la tabla `credentials`:

```sql
-- Ver credenciales guardadas
SELECT project_id, updated_at FROM credentials;

-- Las credenciales se gestionan desde la UI del dashboard
```

## Comandos Útiles

```bash
# Listar flows disponibles para un proyecto
curl http://localhost:3000/api/flows?project=sales

# Ejecutar flow específico
cd apps/backend
node run-flow.js --project sales --flow web-flow --type web

# Ver reports
ls apps/backend/newman/reports/<project_id>/
```

## Estructura de Reports

Los reports se guardan organizados por proyecto:

```
apps/backend/newman/reports/
├── sales/
│   ├── auth-2026-04-16T14-30-00.html
│   └── web-flow-2026-04-16T15-45-00.html
├── movilidad_medellin/
└── ...
```
