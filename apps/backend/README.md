# Backend API Tests

Newman test suite for the Mobile Server REST API (`https://mb.inovisec.com`).

## Requirements

- Node.js 18+
- pnpm

## Setup

```bash
pnpm install
```

Credentials are loaded automatically from `../../config/.env`. Make sure it exists with:

```env
MOBILE_USER_CALLSIGN=your_callsign
MOBILE_USER_PASSWORD=your_password
```

## Running tests

```bash
pnpm test
```

Generates an HTML report at `newman/report.html`.

## Project structure

```
apps/backend/
├── collections/
│   └── auth.postman_collection.json    # Postman collection (Login, Logout)
├── environments/
│   └── mobile.postman_environment.json # Base environment (baseUrl, variable slots)
├── newman/
│   └── report.html                     # Generated test report
├── run-tests.js                        # Newman runner — loads .env and injects credentials
└── package.json
```

## How it works

`run-tests.js` loads `config/.env` via `dotenv` and injects `callsign` and `password` as `envVar` into Newman at runtime. Credentials are never hardcoded in the collection or environment files.

## Auth flow

The **Login** test saves the token to the `authToken` environment variable.
The **Logout** test consumes it and clears it at the end.
