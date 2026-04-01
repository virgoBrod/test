import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput    = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton  = page.locator('#submit-button');
    // El snackbar de notistack tiene role="alert" — es el selector más estable
    this.errorBanner   = page.locator('[role="alert"]');
  }

  async goto() {
    await this.page.goto('/lv/index.html#/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForErrorBanner() {
    // Espera que el banner sea visible (notistack lo anima con transform)
    await this.errorBanner.waitFor({ state: 'visible', timeout: 5000 });
  }
}