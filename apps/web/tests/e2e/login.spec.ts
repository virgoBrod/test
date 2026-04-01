import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const email    = process.env.WEB_USER_EMAIL!;
const password = process.env.WEB_USER_PASSWORD!;

test.describe('Login — Web', () => {

  test('login exitoso con credenciales válidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    // Espera navegación al home
    await expect(page).toHaveURL(/\#\/home/, { timeout: 10000 });
  });

  test('login fallido con credenciales inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, 'wrong_password_12345');

    // Espera que el snackbar aparezca y verifica el texto
    await loginPage.waitForErrorBanner();
    await expect(loginPage.errorBanner).toContainText('Validar los datos');
  });

});