# Web E2E Tests — Playwright

Tests end-to-end para la aplicación web, usando [Playwright](https://playwright.dev/).

## Requisitos

- Node.js 18+
- npm 9+

## Setup

### 1. Instalar dependencias

```bash
cd apps/web
npm install
```

### 2. Instalar los browsers de Playwright

```bash
npx playwright install
```

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp config/.env.example config/.env
```

Variables requeridas en `config/.env`:

```
WEB_USER_EMAIL=tu@email.com
WEB_USER_PASSWORD=tupassword
```

> El archivo `.env` va en la raíz del proyecto (`config/.env`), no dentro de `apps/web`.

## Correr los tests

Todos los browsers (Chromium, Firefox, WebKit):

```bash
cd apps/web
npx playwright test
```

Solo un archivo:

```bash
npx playwright test tests/e2e/login.spec.ts
```

Solo Chromium:

```bash
npx playwright test --project=chromium
```

## Ver el reporte

Después de correr los tests, abrí el reporte HTML:

```bash
npx playwright show-report
```

## Estructura

```
apps/web/
├── pages/          # Page Objects (LoginPage, etc.)
├── tests/
│   └── e2e/        # Tests por feature
├── playwright.config.ts
└── package.json
```
