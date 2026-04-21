# Mobile Test Flows

Automated mobile UI tests using **Maestro**. Tests run sequentially as a single flow: auth → inventory → sales → task_creation.

## Structure

```
apps/mobile/
├── config/
│   └── android.yaml          # Emulator/device configuration
├── flows/
│   ├── auth/
│   │   ├── login.yaml        # ✅ Login with valid credentials
│   │   └── login_failed.yaml # ❌ Login with invalid credentials (pending)
│   ├── inventory/            # Pending
│   ├── sales/                # Pending
│   └── task_creation/        # Pending
└── utils/                    # Pending
```

## Execution Order

All tests run in sequence — after login succeeds, the next flow continues on the same session:

1. **auth/login.yaml** — Launch app, wait for splash, authenticate
2. **inventory/** — Inventory operations (pending)
3. **sales/** — Sales flow (pending)
4. **task_creation/** — Task creation (pending)

## Prerequisites

- Maestro installed: https://maestro.mobile.dev/getting-started/installing-maestro
- Android emulator running or physical device connected
- Target app installed: `com.inovisec.broadsecmobileapp`

## How to Run

### Run all flows

```bash
maestro test apps/mobile/flows/auth/login.yaml
```

### Run a specific flow

```bash
maestro test apps/mobile/flows/auth/login_failed.yaml
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

## Current Test Credentials

| User   | Password   | Purpose        |
|--------|------------|----------------|
| JESS13 | Jess123#   | Login success  |

## Flow Format

Each flow is a Maestro YAML file:

```yaml
appId: com.inovisec.broadsecmobileapp

---
- launchApp:
    clearState: true
- waitForAnimationToEnd:
    timeout: 10000
- assertVisible: "SIGN IN"
- tapOn: "Username"
- inputText: "JESS13"
- tapOn: "Password"
- inputText: "Jess123#"
- pressKey: Enter
- tapOn: "LOG IN"
- waitForAnimationToEnd:
    timeout: 10000
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
