import { test, expect } from "@playwright/test"

test("sign-in page loads", async ({ page }) => {
  await page.goto("/sign-in")
  await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible()
  await expect(page.getByRole("link", { name: /cadastre-se/i })).toBeVisible()
})
