# Backend API Tests

Newman test suite for the Broadsec REST APIs.

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
WEB_BASE_URL=https://web.inovisec.com
```

## Running tests individually

### Auth

```bash
pnpm test:auth
```

Validates login and logout against the auth endpoint.

### Mobile Flow

```bash
pnpm test:mobile-flow
```

Full mobile operator flow: Login → emergencies, incidents, state changes → Logout.

### Web Flow

```bash
pnpm test:web-flow
```

Full web operator flow: Login → Home data (grouped types, departments, zones, incidents) → Incident detail (locations, transcription, video, images, CallAI) → Dispatch (dispatch, in-site, close) → Logout.

---

Each command generates an HTML report at `newman/report.html`.

## Project structure

```
apps/backend/
├── collections/
│   ├── auth.postman_collection.json          # Login, Logout
│   ├── mobile-flow.postman_collection.json   # Full mobile operator flow
│   └── web-flow.postman_collection.json      # Full web operator flow
├── environments/
│   ├── mobile.postman_environment.json       # Mobile base environment
│   └── web.postman_environment.json          # Web base environment
├── newman/
│   └── report.html                           # Generated test report
├── run-tests.js                              # Auth runner
├── run-mobile-flow.js                        # Mobile flow runner
├── run-web-flow.js                           # Web flow runner
└── package.json
```

## How it works

Each runner loads `config/.env` via `dotenv` and injects credentials as `envVar` into Newman at runtime. Credentials are never hardcoded in the collection or environment files.

Tokens and dynamic values (incident IDs, carbyne IDs, agent history IDs, etc.) are passed between requests using `pm.environment.set()` inside each request's test script — no manual setup needed between steps.
