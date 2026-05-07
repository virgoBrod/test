# Mobile Test Flows

Automated mobile UI tests using **Maestro**. Tests run sequentially as a single flow: auth → inventory → sales → task_creation.

## Structure

```
apps/mobile/
├── config/
│   └── android.yaml          # Emulator/device configuration
├── flows/
│   ├── auth/
│   │   ├── permissions.yaml  # ✅ Grant app permissions (run before login)
│   │   ├── login.yaml        # ✅ Login with valid credentials
│   │   └── login_failed.yaml # ❌ Login with invalid credentials (pending)
│   ├── inventory/            # Pending
│   ├── sales/                # Pending
│   └── task_creation/        # Pending
└── utils/                    # Pending
```

## Execution Order

Each flow is independent and complete. Run them separately:

1. **auth/permissions.yaml** — Login + grant all app permissions (first time or after clearState)
2. **auth/login.yaml** — Login + complete flow (assumes permissions already granted)
3. **inventory/** — Inventory operations (pending)
4. **sales/** — Sales flow (pending)
5. **task_creation/** — Task creation (pending)

## Prerequisites

- Maestro installed: https://maestro.mobile.dev/getting-started/installing-maestro
- Android emulator running or physical device connected
- Target app installed: `com.inovisec.broadsecmobileapp`

## How to Run

### First time setup (grant permissions)

```bash
# Login + grant all permissions
maestro test apps/mobile/flows/auth/permissions.yaml --env MOBILE_USERNAME=JESS13 --env MOBILE_PASSWORD="Jess123#"
```

### Normal test run (permissions already granted)

```bash
# Login + complete flow
maestro test apps/mobile/flows/auth/login.yaml --env MOBILE_USERNAME=JESS13 --env MOBILE_PASSWORD="Jess123#"
```

### Run with a specific device/emulator

```bash
maestro test apps/mobile/flows/auth/login.yaml --device <device_id>
```

### List connected devices

```bash
maestro start-device
# or
adb devices
```

## Test Credentials

Credentials are passed via environment variables to avoid hardcoding.

### Setup

1. Copy the example env file:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```

2. Run tests with credentials:
   ```bash
   maestro test apps/mobile/flows/auth/login.yaml --env MOBILE_USERNAME=JESS13 --env MOBILE_PASSWORD="Jess123#"
   ```

| Variable | Purpose |
|----------|---------|
| `MOBILE_USERNAME` | Login username |
| `MOBILE_PASSWORD` | Login password |

## Flow Format

Each flow is a Maestro YAML file:

### Permissions Flow (permissions.yaml) - First time setup

```yaml
appId: com.inovisec.broadsecmobileapp

---
- launchApp:
    clearState: true
- waitForAnimationToEnd:
    timeout: 10000
- assertVisible: "SIGN IN"
- tapOn: "Username"
- inputText: ${MOBILE_USERNAME}
- tapOn: "Password"
- inputText: ${MOBILE_PASSWORD}
- pressKey: Enter
- tapOn: "LOG IN"
- waitForAnimationToEnd:
    timeout: 5000

# Permissions (all optional)
- tapOn:
    text: "While using the app"
    optional: true
- tapOn:
    text: "Allow"
    optional: true
- tapOn:
    text: "Allow all"
    optional: true
- tapOn:
    text: "Allow all the time"
    optional: true

- back
- assertVisible:
    text: "Hola! ${MOBILE_USERNAME}"
    optional: true
- stopApp
```

### Login Flow (login.yaml) - Normal test run

```yaml
appId: com.inovisec.broadsecmobileapp

---
- launchApp:
    clearState: true
- waitForAnimationToEnd:
    timeout: 10000
- assertVisible: "SIGN IN"
- tapOn: "Username"
- inputText: ${MOBILE_USERNAME}
- tapOn: "Password"
- inputText: ${MOBILE_PASSWORD}
- pressKey: Enter
- tapOn: "LOG IN"
- waitForAnimationToEnd:
    timeout: 5000
- tapOn: "Later"
- waitForAnimationToEnd:
    timeout: 5000
# ... continue with flow (armament, vehicle, etc.)
- tapOn: "SAVE"
- stopApp
```

## Maestro Commands

### CLI Commands (terminal)

| Comando | Para qué sirve |
|---------|----------------|
| `maestro test <flow.yaml>` | Ejecutar un flow |
| `maestro test <dir>/` | Ejecutar todos los flows de un directorio |
| `maestro start-device` | Iniciar emulador Android |
| `maestro start-device --platform ios` | Iniciar simulador iOS |
| `maestro devices` | Listar dispositivos conectados |
| `maestro studio` | Abrir Studio (grabar/inspeccionar UI) |
| `maestro hierarchy` | Ver árbol completo de la UI actual |
| `maestro query` | Query elementos visibles en pantalla |
| `maestro record` | Grabar video del dispositivo |

### Flow Commands (YAML)

| Comando | Para qué sirve |
|---------|----------------|
| `launchApp` | Abrir la app (con `clearState`, `stopApp`, `permissions`) |
| `tapOn` | Click por texto, ID o coordenadas |
| `inputText` | Escribir texto en el input activo |
| `assertVisible` | Verificar que un elemento existe en pantalla |
| `assertNotVisible` | Verificar que NO existe |
| `waitForAnimationToEnd` | Esperar a que termine de cargar |
| `back` | Botón atrás del dispositivo |
| `hideKeyboard` | Cerrar teclado virtual |
| `scroll` | Scroll hacia abajo (o `scrollUntilVisible`) |
| `swipe` | Swipe en una dirección |
| `takeScreenshot` | Captura de pantalla |
| `stopApp` | Cerrar la app |
| `clearState` | Limpiar datos de la app |
| `runFlow` | Ejecutar otro flow YAML (composición) |
| `copyTextFrom` | Copiar texto de un elemento a variable |
| `evalScript` | Ejecutar JS (condicionales, loops) |
| `repeat` | Repetir pasos N veces |
| `pointAction` | Click por coordenadas `x, y` |

### Scroll Patterns

```yaml
# Scroll simple hacia abajo
- scroll

# Scroll hasta encontrar un elemento
- scrollUntilVisible:
    element: "Texto o ID del elemento"
    direction: DOWN
    timeout: 30000
    swipe: 500

# Scroll hacia arriba
- scroll
  direction: UP
```

## Maestro Docs

Full reference: https://maestro.mobile.dev/
