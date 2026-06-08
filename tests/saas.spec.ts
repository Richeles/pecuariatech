import { test, expect } from "@playwright/test";

test("PecuariaTech Home", async ({ page }) => {

  await page.goto("http://127.0.0.1:3333");

  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle(/PecuariaTech/i);

});

test("PecuariaTech Login", async ({ page }) => {

  await page.goto("http://127.0.0.1:3333/pt/login");

  await page.waitForLoadState("networkidle");

  await expect(page.locator("h1")).toContainText(
    "PecuariaTech"
  );

});

test("PecuariaTech Planos", async ({ page }) => {

  await page.goto("http://127.0.0.1:3333/pt/planos");

  await page.waitForLoadState("networkidle");

  await expect(page).toHaveURL(
    /planos/
  );

});