import { test, expect } from '@playwright/test';

const email = process.env.WEB_USER_EMAIL!;
const password = process.env.WEB_USER_PASSWORD!;
const baseUrl = 'https://web.inovisec.com';

test.describe('Sales — WebSocket Types', () => {

  test('conecta al websocket y lista los tipos de mensajes recibidos', async ({ request, page }) => {

    // 1. Login via API
    const loginRes = await request.post(`${baseUrl}/auth`, {
      data: { email, password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    const token = loginBody.token;
    expect(token).toBeTruthy();

    console.log('✅ Login exitoso');

    // 2. Conectar al WebSocket y recolectar types
    const types: string[] = [];

    await page.evaluate(async (tok: string) => {
      return new Promise<string[]>((resolve) => {
        const ws = new WebSocket(`wss://web.inovisec.com/ws?token=${tok}`);
        const collected: string[] = [];

        ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type) {
              collected.push(data.type);
            }
          } catch {
            // ignore non-JSON messages
          }
        };

        // Esperar 10 segundos y resolver
        setTimeout(() => {
          ws.close();
          resolve(collected);
        }, 10000);
      });
    }, token).then((result: string[]) => {
      types.push(...result);
    });

    // 3. Reportar resultados
    const uniqueTypes = [...new Set(types)];

    console.log('\n========== WebSocket Types (10s) ==========');
    console.log(`Total mensajes recibidos: ${types.length}`);
    console.log(`Tipos únicos encontrados: ${uniqueTypes.length}`);
    console.log('\nListado de types:');
    uniqueTypes.forEach((t, i) => {
      const count = types.filter((x) => x === t).length;
      console.log(`  ${i + 1}. ${t} (${count} mensajes)`);
    });
    console.log('============================================\n');

    // Aserción mínima: al menos un tipo recibido (puede fallar si no hay actividad)
    expect(uniqueTypes.length).toBeGreaterThan(0);

    // 4. Logout
    const logoutRes = await request.post(`${baseUrl}/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logoutRes.ok()).toBeTruthy();
    console.log('✅ Logout exitoso');
  });

});
