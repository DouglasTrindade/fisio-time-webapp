import { test, expect } from "@playwright/test";

const createUniquePatient = async (
  page: import("@playwright/test").Page,
) => {
  await page.goto("/pacientes");
  await page.waitForURL(/\/pacientes/, { timeout: 2_000 });

  await page.getByRole("button", { name: "Novo Paciente" }).click();
  await expect(
    page.getByRole("heading", { name: "Novo Paciente" }),
  ).toBeVisible();

  const patientName = `Paciente E2E ${Date.now()}`;
  await page.getByLabel("Nome").fill(patientName);
  await page.getByLabel("Telefone").fill("(11) 97777-2222");

  await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByRole("heading", { name: "Novo Paciente" }),
  ).toBeHidden();

  return patientName;
};

const createAppointmentForPatient = async (
  page: import("@playwright/test").Page,
  patientName: string,
) => {
  await page.goto("/agendamentos");
  await page.waitForURL(/\/agendamentos/, { timeout: 2_000 });

  const existingAppointments = await page
    .getByTestId("calendar-appointment")
    .count();

  await page.getByRole("button", { name: "Novo agendamento" }).click();
  await expect(
    page.getByRole("heading", { name: "Novo Agendamento" }),
  ).toBeVisible();

  const patientSelect = page.getByRole("combobox", { name: /paciente/i });
  await patientSelect.click();
  const patientOption = page.getByRole("option", { name: patientName });
  await expect(patientOption).toBeVisible();
  await patientOption.click();

  await page.getByLabel("Telefone").fill("(11) 99999-0000");

  const nowPlusOneHour = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  const dateValue = `${nowPlusOneHour.getFullYear()}-${pad(
    nowPlusOneHour.getMonth() + 1,
  )}-${pad(nowPlusOneHour.getDate())}T${pad(
    nowPlusOneHour.getHours(),
  )}:${pad(nowPlusOneHour.getMinutes())}`;

  await page.getByLabel("Data").fill(dateValue);
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByRole("heading", { name: "Novo Agendamento" }),
  ).toBeHidden();

  await expect
    .poll(
      async () => await page.getByTestId("calendar-appointment").count(),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(existingAppointments);

  return patientName;
};

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

    const emailInput = page.locator(
      'input[type="email"][placeholder="seu@email.com"]',
    );
    await emailInput.waitFor({ state: "visible", timeout: 5_000 });
    await emailInput.click();
    await emailInput.fill(email);
    await expect(emailInput).toHaveValue(email);

    const passwordInput = page.locator(
      'input[type="password"][placeholder="••••••••"]',
    );
    await passwordInput.click();
    await passwordInput.fill(password);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/(dashboard|agendamentos)/, { timeout: 10_000 });

    if (page.url().includes("/sign-in")) {
      throw new Error(
        "Login não concluiu. Verifique E2E_EMAIL/E2E_PASSWORD e o fluxo de autenticação.",
      );
    }
  }
};

test.describe("Appointments", () => {
  test.describe.configure({ timeout: 20_000 });
  test.describe("Renderization", () => {
    test("calendar renders and appointments/empty state are visible", async ({
      page,
    }) => {
      await ensureAuthenticated(page);
      await page.goto("/agendamentos");
      await page.waitForURL(/\/agendamentos/, { timeout: 2_000 });

      await expect
        .poll(
          async () => {
            if ((await page.getByTestId("calendar-root").count()) > 0) {
              return "calendar";
            }
            if (
              (await page.getByText("Nenhum agendamento encontrado").count()) >
              0
            ) {
              return "empty";
            }
            return "none";
          },
          { timeout: 5_000 },
        )
        .toMatch(/calendar|empty/);

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

  test.describe("Create", () => {
    test("open modal and create a appointment", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await createAppointmentForPatient(page, patientName);

      await expect(
        page
          .getByTestId("calendar-appointment")
          .filter({ hasText: patientName })
          .first(),
      ).toBeVisible();
    });
  });

  test.describe("Edit", () => {
    test("opens edit dialog from appointment details", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await createAppointmentForPatient(page, patientName);

      const appointmentItems = page
        .getByTestId("calendar-appointment")
        .filter({ hasText: patientName });
      await appointmentItems.first().click();
      await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
      await page.getByRole("button", { name: "Editar" }).click();
      await expect(page.getByText("Editar Agendamento")).toBeVisible();

      const patientSelect = page.getByRole("combobox", { name: /paciente/i });
      await patientSelect.click();
      const updatedPatientName = await createUniquePatient(page);
      const updatedPatientOption = page.getByRole("option", {
        name: updatedPatientName,
      });
      await expect(updatedPatientOption).toBeVisible();
      await updatedPatientOption.click();

      await page.getByLabel("Telefone").fill("(21) 98888-1111");

      const nowPlusTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const pad = (value: number) => String(value).padStart(2, "0");
      const updatedDateValue = `${nowPlusTwoHours.getFullYear()}-${pad(
        nowPlusTwoHours.getMonth() + 1,
      )}-${pad(nowPlusTwoHours.getDate())}T${pad(
        nowPlusTwoHours.getHours(),
      )}:${pad(nowPlusTwoHours.getMinutes())}`;

      await page.getByLabel("Data").fill(updatedDateValue);

      const statusSelect = page.getByRole("combobox", { name: /status/i });
      await statusSelect.click();
      await page.getByRole("option", { name: /confirmado/i }).click();

      await page
        .getByLabel("Observações")
        .fill("Agendamento atualizado via teste e2e.");

      await page.getByRole("button", { name: "Salvar" }).click();
      await expect(page.getByText("Editar Agendamento")).toBeHidden();

      await expect(
        page
          .getByTestId("calendar-appointment")
          .filter({ hasText: updatedPatientName })
          .first(),
      ).toBeVisible();
    });
  });

  test.describe("Delete", () => {
    test("opens delete confirmation", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await createAppointmentForPatient(page, patientName);

      const appointmentItems = page.getByTestId("calendar-appointment");
      const existingAppointments = await appointmentItems.count();

      await appointmentItems
        .filter({ hasText: patientName })
        .first()
        .click();
      await page.getByRole("button", { name: "Excluir" }).click();
      await expect(page.getByText("Excluir agendamento")).toBeVisible();
      await page.getByRole("button", { name: /sim, excluir/i }).click();

      await expect
        .poll(
          async () =>
            await page.getByTestId("calendar-appointment").count(),
          { timeout: 10_000 },
        )
        .toBeLessThan(existingAppointments);
    });
  });

  test.describe("Errors", () => {
    test("shows error when delete fails", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await createAppointmentForPatient(page, patientName);

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

      await page
        .getByTestId("calendar-appointment")
        .filter({ hasText: patientName })
        .first()
        .click();
      await page.getByRole("button", { name: "Excluir" }).click();
      await page.getByRole("button", { name: /sim, excluir/i }).click();
      await expect(page.getByText("Erro ao excluir agendamento")).toBeVisible();
    });
  });
});
