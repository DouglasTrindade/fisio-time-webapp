import { test, expect } from "@playwright/test";

const createUniquePatient = async (
  page: import("@playwright/test").Page,
) => {
  await page.goto("/pacientes");
  await assertNoRoutingError(page);
  await page.waitForURL(/\/pacientes/, { timeout: 2_000 });

  await page.getByRole("button", { name: "Novo Paciente" }).click();
  await expect(
    page.getByRole("heading", { name: "Novo Paciente" }),
  ).toBeVisible();

  const patientName = `Paciente E2E ${Date.now()}`;
  const phoneSuffix = String(Date.now() % 100000000).padStart(8, "0");
  const phoneValue = `(11) 9${phoneSuffix.slice(0, 4)}-${phoneSuffix.slice(4)}`;
  await page.getByPlaceholder("Nome do paciente").fill(patientName);
  await page.getByLabel("Telefone").fill(phoneValue);

  await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("button", { name: "Avançar" }).click();
  let saveResponse: import("@playwright/test").Response | null = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/patients") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Salvar" }).click();
    saveResponse = await saveResponsePromise;
    if (saveResponse.ok()) break;
    if (saveResponse.status() === 429) {
      const backoffMs = Math.min(8_000, 500 * 2 ** attempt);
      await page.waitForTimeout(backoffMs);
      continue;
    }
    const body = await saveResponse.text();
    throw new Error(
      `Falha ao criar paciente: ${saveResponse.status()} ${body}`,
    );
  }
  if (!saveResponse || !saveResponse.ok()) {
    const body = saveResponse ? await saveResponse.text() : "";
    throw new Error(
      `Falha ao criar paciente: ${saveResponse?.status() ?? "sem resposta"} ${body}`,
    );
  }

  await expect(
    page.getByRole("heading", { name: "Novo Paciente" }),
  ).toBeHidden({ timeout: 10_000 });

  return patientName;
};

const buildDateTimeValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const selectPatientOption = async (
  page: import("@playwright/test").Page,
  preferredName?: string,
) => {
  const patientSelect = page.getByRole("combobox", { name: /paciente/i });
  await expect(patientSelect).toBeVisible({ timeout: 10_000 });
  await patientSelect.click();

  if (preferredName) {
    const preferredOption = page.getByRole("option", { name: preferredName });
    if ((await preferredOption.count()) > 0) {
      await preferredOption.click();
      return preferredName;
    }
  }

  const options = page.getByRole("option");
  if ((await options.count()) === 0) {
    throw new Error(
      "Nenhum paciente disponível para seleção. Crie um paciente antes de criar um agendamento.",
    );
  }

  const option = options.first();
  const name = (await option.textContent())?.trim() ?? "";
  await option.click();
  return name;
};

const assertNoRoutingError = async (page: import("@playwright/test").Page) => {
  const routingErrorHeading = page.getByRole("heading", {
    name: "Routing Error",
  });
  if ((await routingErrorHeading.count()) > 0) {
    throw new Error(
      "A rota /agendamentos respondeu com erro de roteamento. Verifique se o frontend (Next) está rodando no baseURL do Playwright.",
    );
  }
  const noRouteMatches = page.getByText(/No route matches/i);
  if ((await noRouteMatches.count()) > 0) {
    throw new Error(
      "Nenhuma rota encontrada. Verifique se o servidor correto está rodando no baseURL do Playwright.",
    );
  }
};

const ensureAgendamentosPage = async (
  page: import("@playwright/test").Page,
) => {
  if (!page.url().includes("/agendamentos")) {
    await page.goto("/agendamentos");
    await page.waitForURL(/\/agendamentos/, { timeout: 5_000 });
  }
  await assertNoRoutingError(page);
  await waitForAppointmentsFetch(page, 20_000);
};

const waitForAppointmentsFetch = async (
  page: import("@playwright/test").Page,
  timeout = 20_000,
) => {
  try {
    await page.waitForResponse(
      (response) =>
        response.url().includes("/appointments") &&
        response.request().method() === "GET" &&
        response.ok(),
      { timeout },
    );
  } catch {
    // If the request already happened or is cached, just continue.
  }
};

const openAppointmentDetails = async (page: import("@playwright/test").Page) => {
  await ensureAgendaView(page);
  const appointmentItem = page.getByTestId("calendar-appointment").first();
  await expect(appointmentItem).toBeVisible({ timeout: 10_000 });
  await appointmentItem.click();
};

const createAppointmentForPatient = async (page: import("@playwright/test").Page) => {
  await ensureAgendamentosPage(page);

  let state = await waitForCalendarState(page, 20_000);
  if (state === "error" || state === "none") {
    await page.reload();
    await waitForAppointmentsFetch(page, 20_000);
    state = await waitForCalendarState(page, 20_000);
    if (state === "error" || state === "none") {
      throw new Error("Calendário não ficou pronto para criar agendamento.");
    }
  }

  const newAppointmentButton = page.getByRole("button", {
    name: /novo agendamento/i,
  });
  await expect(newAppointmentButton).toBeVisible({ timeout: 5_000 });
  await newAppointmentButton.click();
  await expect(
    page.getByRole("heading", { name: "Novo Agendamento" }),
  ).toBeVisible();

  await selectPatientOption(page);

  await page.getByLabel("Telefone").fill("(11) 99999-0000");

  const nowPlusOneHour = new Date(Date.now() + 60 * 60 * 1000);
  const dateValue = buildDateTimeValue(nowPlusOneHour);
  const marker = `E2E ${Date.now()}`;

  await page.getByLabel("Data").fill(dateValue);
  await page.getByLabel("Observações").fill(marker);
  let saveResponse: import("@playwright/test").Response | null = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/appointments") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Salvar" }).click();
    saveResponse = await saveResponsePromise;
    if (saveResponse.ok()) break;
    if (saveResponse.status() === 429) {
      const backoffMs = Math.min(4_000, 500 * 2 ** attempt);
      await page.waitForTimeout(backoffMs);
      continue;
    }
    const body = await saveResponse.text();
    throw new Error(
      `Falha ao criar agendamento: ${saveResponse.status()} ${body}`,
    );
  }
  if (!saveResponse || !saveResponse.ok()) {
    const body = saveResponse ? await saveResponse.text() : "";
    throw new Error(
      `Falha ao criar agendamento: ${saveResponse?.status() ?? "sem resposta"} ${body}`,
    );
  }

  await expect(
    page.getByRole("heading", { name: "Novo Agendamento" }),
  ).toBeHidden();

  await ensureAgendaView(page);
};

const ensureAgendaView = async (page: import("@playwright/test").Page) => {
  const agendaButton = page.getByRole("button", { name: /ver por agenda/i });
  if (await agendaButton.count()) {
    await agendaButton.click();
  }
};

const ensureAuthenticated = async (page: import("@playwright/test").Page) => {
  await page.goto("/agendamentos");
  await assertNoRoutingError(page);
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
    await waitForAppointmentsFetch(page, 20_000);
    await Promise.race([
      page.waitForURL(/\/(dashboard|agendamentos)/, { timeout: 20_000 }),
      page
        .getByRole("button", { name: "Novo agendamento" })
        .waitFor({ state: "visible", timeout: 20_000 }),
      page
        .getByText("Nenhum agendamento encontrado")
        .waitFor({ state: "visible", timeout: 20_000 }),
    ]);

    if (page.url().includes("/sign-in")) {
      throw new Error(
        "Login não concluiu. Verifique E2E_EMAIL/E2E_PASSWORD e o fluxo de autenticação.",
      );
    }
  }
};

const waitForCalendarState = async (
  page: import("@playwright/test").Page,
  timeout = 10_000,
) => {
  const calendarRoot = page.getByTestId("calendar-root");
  const emptyText = page.getByText("Nenhum agendamento encontrado");
  const errorText = page.getByText("Não foi possível carregar os agendamentos.");
  const newAppointmentButton = page.getByRole("button", {
    name: /novo agendamento/i,
  });
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    await assertNoRoutingError(page);
    if ((await calendarRoot.count()) > 0) return "calendar";
    if ((await emptyText.count()) > 0) return "empty";
    if ((await newAppointmentButton.count()) > 0) return "ready";
    if ((await errorText.count()) > 0) return "error";
    await page.waitForTimeout(200);
  }

  return "none";
};

const confirmDeleteWithRetry = async (
  page: import("@playwright/test").Page,
  maxAttempts = 4,
) => {
  let lastResponse: import("@playwright/test").Response | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/appointments/") &&
        response.request().method() === "DELETE",
    );
    await page.getByRole("button", { name: /sim, excluir/i }).click();
    lastResponse = await deleteResponsePromise;
    if (lastResponse.ok()) return;
    if (lastResponse.status() === 429) {
      const backoffMs = Math.min(8_000, 500 * 2 ** attempt);
      await page.waitForTimeout(backoffMs);
      continue;
    }
    const body = await lastResponse.text();
    throw new Error(
      `Falha ao excluir agendamento: ${lastResponse.status()} ${body}`,
    );
  }
  const body = lastResponse ? await lastResponse.text() : "";
  throw new Error(
    `Falha ao excluir agendamento: ${lastResponse?.status() ?? "sem resposta"} ${body}`,
  );
};

test.describe("Appointments", () => {
  test.describe.configure({ timeout: 60_000 });
  test.describe("Renderização", () => {
    test("calendar renders and appointments/empty state are visible", async ({
      page,
    }) => {
      await ensureAuthenticated(page);
      await page.goto("/agendamentos");
      await page.waitForURL(/\/agendamentos/, { timeout: 2_000 });

      const state = await waitForCalendarState(page);
      if (state === "error") {
        throw new Error("Não foi possível carregar os agendamentos.");
      }
      expect(state).toMatch(/calendar|empty|ready/);

      const calendarRoot = page.getByTestId("calendar-root");
      const hasCalendar = (await calendarRoot.count()) > 0;
      if (hasCalendar) {
        await expect(calendarRoot).toBeVisible();
      }

      const appointmentItems = page.getByTestId("calendar-appointment");
      if ((await appointmentItems.count()) === 0) {
        await expect(page.getByText("Nenhum agendamento encontrado")).toBeVisible();
      } else {
        await expect(appointmentItems.first()).toBeVisible();
      }
    });
  });

  test.describe("Criação", () => {
    test("open modal and create a appointment", async ({ page }) => {
      await ensureAuthenticated(page);
      await createAppointmentForPatient(page);
    });
  });

  test.describe("Listagem", () => {
    test("lists appointments in agenda view", async ({ page }) => {
      await ensureAuthenticated(page);
      await ensureAgendaView(page);
      const appointmentItems = page.getByTestId("calendar-appointment");
      let state = await waitForCalendarState(page, 10_000);
      if (state === "none") {
        await page.reload();
        await waitForAppointmentsFetch(page, 20_000);
        state = await waitForCalendarState(page, 10_000);
      }
      if (state === "error") {
        throw new Error("Estado do calendário inválido na listagem.");
      }
      if ((await appointmentItems.count()) > 0) {
        await expect(appointmentItems.first()).toBeVisible({ timeout: 10_000 });
      }
    });
  });

  test.describe("Visualização", () => {
    test("opens appointment details", async ({ page }) => {
      await ensureAuthenticated(page);
      await ensureAgendaView(page);
      const appointmentItems = page.getByTestId("calendar-appointment");
      if ((await appointmentItems.count()) === 0) {
        await createAppointmentForPatient(page);
      }
      await openAppointmentDetails(page);
      await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
    });
  });

  test.describe("Edição", () => {
    test("opens edit dialog from appointment details", async ({ page }) => {
      await ensureAuthenticated(page);
      await createAppointmentForPatient(page);

      await openAppointmentDetails(page);
      await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
      await page.getByRole("button", { name: "Editar" }).click();
      await expect(page.getByText("Editar Agendamento")).toBeVisible();

      await selectPatientOption(page);

      await page.getByLabel("Telefone").fill("(21) 98888-1111");

      const nowPlusTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const updatedDateValue = buildDateTimeValue(nowPlusTwoHours);

      await page.getByLabel("Data").fill(updatedDateValue);

      const statusSelect = page.getByRole("combobox", { name: /status/i });
      await statusSelect.click();
      await page.getByRole("option", { name: /confirmado/i }).click();

      await page
        .getByLabel("Observações")
        .fill("Agendamento atualizado via teste e2e.");

      await page.getByRole("button", { name: "Salvar" }).click();
      await expect(page.getByText("Editar Agendamento")).toBeHidden({
        timeout: 10_000,
      });
    });
  });

  test.describe("Exclusão", () => {
    test("opens delete confirmation", async ({ page }) => {
      await ensureAuthenticated(page);
      await createAppointmentForPatient(page);

      await ensureAgendaView(page);
      await openAppointmentDetails(page);
      await page.getByRole("button", { name: "Excluir" }).click();
      await expect(page.getByText("Excluir agendamento")).toBeVisible();
      await confirmDeleteWithRetry(page);
      await expect(page.getByText("Excluir agendamento")).toBeHidden({
        timeout: 10_000,
      });
    });
  });
});
