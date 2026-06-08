# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saas.spec.ts >> PecuariaTech Home
- Location: tests\saas.spec.ts:3:5

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /PecuariaTech/i
Received string:  ""
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    13 × unexpected value ""

```

```yaml
- main:
  - text: Runtime Cognitivo Online
  - heading "PecuariaTech" [level=1]
  - paragraph: Plataforma operacional cognitiva para gestão financeira, rebanho, pastagem, engorda e inteligência pecuária.
  - link "Entrar":
    - /url: /pt/login
  - link "Ver Planos":
    - /url: /pt/planos
  - link "Criar Conta":
    - /url: /cadastro
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("PecuariaTech Home", async ({ page }) => {
  4  | 
  5  |   await page.goto("http://127.0.0.1:3333");
  6  | 
  7  |   await page.waitForLoadState("networkidle");
  8  | 
> 9  |   await expect(page).toHaveTitle(/PecuariaTech/i);
     |                      ^ Error: expect(page).toHaveTitle(expected) failed
  10 | 
  11 | });
  12 | 
  13 | test("PecuariaTech Login", async ({ page }) => {
  14 | 
  15 |   await page.goto("http://127.0.0.1:3333/pt/login");
  16 | 
  17 |   await page.waitForLoadState("networkidle");
  18 | 
  19 |   await expect(page.locator("h1")).toContainText(
  20 |     "PecuariaTech"
  21 |   );
  22 | 
  23 | });
  24 | 
  25 | test("PecuariaTech Planos", async ({ page }) => {
  26 | 
  27 |   await page.goto("http://127.0.0.1:3333/pt/planos");
  28 | 
  29 |   await page.waitForLoadState("networkidle");
  30 | 
  31 |   await expect(page).toHaveURL(
  32 |     /planos/
  33 |   );
  34 | 
  35 | });
```