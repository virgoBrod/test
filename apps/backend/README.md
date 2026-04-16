# Backend API Tests

Newman test suite for the Broadsec REST APIs with multi-project support.

## Requirements

- Node.js 18+
- pnpm

## Setup

```bash
pnpm install
```

Credentials are loaded automatically from `../../config/.env`. Create it with:

```env
# Mobile
MOBILE_USER_CALLSIGN=your_callsign
MOBILE_USER_PASSWORD=your_password

# Web
WEB_USER_EMAIL=your_email
WEB_USER_PASSWORD=your_password
```

## Supported Projects

- **sales** - SALES/DEMO (https://web.inovisec.com, https://mb.inovisec.com)
- **movilidad_medellin** - Movilidad Medellín
- **medellin** - Medellín
- **lv** - LV
- **amva** - AMVA

## Running Tests

### New Unified Runner (Recommended)

```bash
# Run specific project and flow
node run-flow.js --project <project> --flow <flow> --type <mobile|web>

# Examples:
node run-flow.js --project sales --flow auth --type mobile
node run-flow.js --project sales --flow web-flow --type web
node run-flow.js --project movilidad_medellin --flow mobile-flow --type mobile
```

### NPM Scripts

```bash
# All tests for a project (defaults to auth flow)
pnpm test:sales
pnpm test:movilidad
pnpm test:medellin
pnpm test:lv
pnpm test:amva

# Specific flows
pnpm test:sales:auth
pnpm test:sales:mobile
pnpm test:sales:web

pnpm test:movilidad:auth
pnpm test:movilidad:mobile
pnpm test:movilidad:web

# Legacy commands (uses sales project by default)
pnpm test:auth
pnpm test:mobile-flow
pnpm test:web-flow
```

### CLI Options

- `--project <name>` - Project to test (sales, movilidad_medellin, medellin, lv, amva)
- `--flow <name>` - Flow to execute (auth, mobile-flow, web-flow)
- `--type <type>` - Test type (mobile, web)

## Project Structure

```
apps/backend/
├── collections/
│   ├── sales/
│   │   ├── auth.postman_collection.json
│   │   ├── mobile-flow.postman_collection.json
│   │   └── web-flow.postman_collection.json
│   ├── movilidad_medellin/
│   │   └── ... (empty placeholders)
│   ├── medellin/
│   │   └── ... (empty placeholders)
│   ├── lv/
│   │   └── ... (empty placeholders)
│   └── amva/
│       └── ... (empty placeholders)
├── environments/
│   └── projects/
│       ├── sales.postman_environment.json
│       ├── web.sales.postman_environment.json
│       ├── movilidad_medellin.postman_environment.json
│       ├── web.movilidad_medellin.postman_environment.json
│       └── ... (one for each project)
├── newman/
│   └── reports/
│       ├── sales/
│       │   └── <flow>-<timestamp>.html
│       └── ... (reports organized by project)
├── run-flow.js                 # Unified runner
├── run-tests.js                # Legacy auth runner
├── run-mobile-flow.js          # Legacy mobile runner
├── run-web-flow.js             # Legacy web runner
└── package.json
```

## How It Works

1. **Project Selection**: The `--project` flag selects which project's collections and environments to use
2. **Base URLs**: Each project has its own base URLs configured in `environments/projects/<project>.postman_environment.json`
3. **Credentials**: Loaded from `config/.env` and injected at runtime via `envVar`
4. **Reports**: Generated at `newman/reports/<project>/<flow>-<timestamp>.html`

## Adding New Project Flows

1. Create collection files in `collections/<project_id>/`
2. Create environment files in `environments/projects/` (mobile + web)
3. Add project entry to dashboard database with correct base URLs
4. Test with: `node run-flow.js --project <project_id> --flow <flow_name>`

## Legacy Compatibility

The old runner scripts (`run-tests.js`, `run-mobile-flow.js`, `run-web-flow.js`) still work and default to the **sales** project for backward compatibility.
