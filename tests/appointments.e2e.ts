import { test, expect } from "@playwright/test";

const ensureAuthenticated = async (page: import("@playwright/test").Page) => {
  await page.goto("/agendamentos");
  if (page.url().includes("/sign-in")) {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Defina E2E_EMAIL e E2E_PASSWORD para executar o fluxo autenticado.",
      );
    }

    await page.getByPlaceholder("seu@email.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/agendamentos/, { timeout: 20_000 });

    if (page.url().includes("/sign-in")) {
      throw new Error(
        "Login não concluiu. Verifique E2E_EMAIL/E2E_PASSWORD e o fluxo de autenticação.",
      );
    }
  }
};

test.describe("Appointments", () => {
  test.describe("Renderization", () => {
    test("calendar renders and appointments/empty state are visible", async ({
      page,
    }) => {
      await ensureAuthenticated(page);
      await expect.poll(
        async () => {
        if ((await page.getByTestId("calendar-root").count()) > 0) {
          return "calendar";
        }
        if ((await page.getByText("Nenhum agendamento encontrado").count()) > 0) {
          return "empty";
        }
        return "none";
        },
        { timeout: 15_000 }
      ).toMatch(/calendar|empty/);

      const calendarRoot = page.getByTestId("calendar-root");
      const hasCalendar = (await calendarRoot.count()) > 0;
      if (hasCalendar) {
        await expect(calendarRoot).toBeVisible();
      }

      const appointmentItems = page.getByTestId("calendar-appointment");
      const count = await appointmentItems.count();

      if (count === 0) {
        await expect(
          page.getByText("Nenhum agendamento encontrado"),
        ).toBeVisible();
      } else {
        await expect(appointmentItems.first()).toBeVisible();
      }
    });
  });

  test.describe("Creation", () => {
    test("opens new appointment dialog", async ({ page }) => {
      await ensureAuthenticated(page);
      await page.getByRole("button", { name: /novo agendamento/i }).click();
      await expect(
        page.getByRole("heading", { name: "Novo Agendamento" }),
      ).toBeVisible();
    });
  });

  test.describe("Edit", () => {
    test("opens edit dialog from appointment details", async ({ page }) => {
      await ensureAuthenticated(page);
      const appointmentItems = page.getByTestId("calendar-appointment");
      const count = await appointmentItems.count();
      test.skip(count === 0, "Sem agendamentos para editar");

      await appointmentItems.first().click();
      await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
      await page.getByRole("button", { name: "Editar" }).click();
      await expect(page.getByText("Editar Agendamento")).toBeVisible();
    });
  });

  test.describe("Exclusion", () => {
    test("opens delete confirmation", async ({ page }) => {
      await ensureAuthenticated(page);
      const appointmentItems = page.getByTestId("calendar-appointment");
      const count = await appointmentItems.count();
      test.skip(count === 0, "Sem agendamentos para excluir");

      await appointmentItems.first().click();
      await page.getByRole("button", { name: "Excluir" }).click();
      await expect(page.getByText("Excluir agendamento")).toBeVisible();
    });
  });

  test.describe("Errors", () => {
    test("shows error when delete fails", async ({ page }) => {
      await ensureAuthenticated(page);
      const appointmentItems = page.getByTestId("calendar-appointment");
      const count = await appointmentItems.count();
      test.skip(count === 0, "Sem agendamentos para excluir");

      await page.route("**/appointments/*", async (route) => {
        if (route.request().method() === "DELETE") {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ message: "Erro ao excluir agendamento" }),
          });
          return;
        }
        await route.fallback();
      });

      await appointmentItems.first().click();
      await page.getByRole("button", { name: "Excluir" }).click();
      await page.getByRole("button", { name: /sim, excluir/i }).click();
      await expect(page.getByText("Erro ao excluir agendamento")).toBeVisible();
    });
  });
});
