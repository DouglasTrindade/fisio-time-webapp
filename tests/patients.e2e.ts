import { test, expect } from "@playwright/test";

const assertNoRoutingError = async (page: import("@playwright/test").Page) => {
  const routingErrorHeading = page.getByRole("heading", {
    name: "Routing Error",
  });
  if ((await routingErrorHeading.count()) > 0) {
    throw new Error(
      "A rota /pacientes respondeu com erro de roteamento. Verifique se o frontend (Next) está rodando no baseURL do Playwright.",
    );
  }
  const noRouteMatches = page.getByText(/No route matches/i);
  if ((await noRouteMatches.count()) > 0) {
    throw new Error(
      "Nenhuma rota encontrada. Verifique se o servidor correto está rodando no baseURL do Playwright.",
    );
  }
};

const waitForPatientsFetch = async (
  page: import("@playwright/test").Page,
  timeout = 20_000,
) => {
  try {
    await page.waitForResponse(
      (response) =>
        response.url().includes("/patients") &&
        response.request().method() === "GET" &&
        response.ok(),
      { timeout },
    );
  } catch (error) {
    const hasPatientsEntry = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("/patients")),
    );
    if (!hasPatientsEntry) {
      throw error;
    }
  }
};

const ensurePatientsPage = async (page: import("@playwright/test").Page) => {
  if (!page.url().includes("/pacientes")) {
    await page.goto("/pacientes");
    await page.waitForURL(/\/pacientes/, { timeout: 5_000 });
  }
  await assertNoRoutingError(page);
  await waitForPatientsFetch(page, 20_000);
};

const ensureAuthenticated = async (page: import("@playwright/test").Page) => {
  await page.goto("/pacientes");
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
    await waitForPatientsFetch(page, 20_000);
    await Promise.race([
      page.waitForURL(/\/(dashboard|pacientes)/, { timeout: 20_000 }),
      page
        .getByRole("button", { name: "Novo Paciente" })
        .waitFor({ state: "visible", timeout: 20_000 }),
      page
        .getByText(/Nenhum paciente (cadastrado|encontrado)/i)
        .waitFor({ state: "visible", timeout: 20_000 }),
    ]);

    if (page.url().includes("/sign-in")) {
      throw new Error(
        "Login não concluiu. Verifique E2E_EMAIL/E2E_PASSWORD e o fluxo de autenticação.",
      );
    }
  }
};

const createUniquePatient = async (page: import("@playwright/test").Page) => {
  await ensurePatientsPage(page);

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
        response.url().includes("/patients") &&
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

const openPatientMenu = async (
  page: import("@playwright/test").Page,
  patientName: string,
) => {
  const row = page.getByRole("row", { name: new RegExp(patientName) });
  await expect(row.first()).toBeVisible({ timeout: 10_000 });
  const menuButton = row
    .first()
    .getByRole("button", { name: "Abrir menu" });
  await menuButton.click();
};

const confirmDeletePatientWithRetry = async (
  page: import("@playwright/test").Page,
  maxAttempts = 4,
) => {
  let lastResponse: import("@playwright/test").Response | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/patients/") &&
        response.request().method() === "DELETE",
    );
    await page.getByRole("button", { name: "Excluir" }).click();
    lastResponse = await deleteResponsePromise;
    if (lastResponse.ok()) return;
    if (lastResponse.status() === 429) {
      const backoffMs = Math.min(8_000, 500 * 2 ** attempt);
      await page.waitForTimeout(backoffMs);
      continue;
    }
    const body = await lastResponse.text();
    throw new Error(
      `Falha ao excluir paciente: ${lastResponse.status()} ${body}`,
    );
  }
  const body = lastResponse ? await lastResponse.text() : "";
  throw new Error(
    `Falha ao excluir paciente: ${lastResponse?.status() ?? "sem resposta"} ${body}`,
  );
};

test.describe("Patients", () => {
  test.describe.configure({ timeout: 60_000 });

  test.describe("Renderização", () => {
    test("lista renderiza e mostra estado vazio ou itens", async ({ page }) => {
      await ensureAuthenticated(page);
      await ensurePatientsPage(page);

      await expect(
        page.getByRole("heading", { name: "Pacientes" }),
      ).toBeVisible();

      const menuButtons = page.getByRole("button", { name: "Abrir menu" });
      if ((await menuButtons.count()) === 0) {
        await expect(
          page.getByText(/Nenhum paciente (cadastrado|encontrado)/i),
        ).toBeVisible();
      } else {
        await expect(menuButtons.first()).toBeVisible();
      }
    });
  });

  test.describe("Criação", () => {
    test("abre modal e cria paciente", async ({ page }) => {
      await ensureAuthenticated(page);
      await createUniquePatient(page);
    });
  });

  test.describe("Listagem", () => {
    test("exibe paciente criado na lista", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await ensurePatientsPage(page);
      await expect(page.getByText(patientName)).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe("Visualização", () => {
    test("abre detalhes do paciente", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await ensurePatientsPage(page);

      await page.getByRole("cell", { name: patientName }).click();
      await page.waitForURL(/\/pacientes\/.+/, { timeout: 10_000 });
      await expect(page.getByText("Sobre o paciente")).toBeVisible();
      await expect(page.getByText(patientName)).toBeVisible();
    });
  });

  test.describe("Edição", () => {
    test("edita paciente pela lista", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await ensurePatientsPage(page);

      await openPatientMenu(page, patientName);
      await page.getByRole("menuitem", { name: "Editar" }).click();
      await expect(
        page.getByRole("heading", { name: /editar paciente/i }),
      ).toBeVisible();

      const marker = `Atualizado E2E ${Date.now()}`;
      await page.getByLabel("Observações").fill(marker);

      await page.getByRole("button", { name: "Avançar" }).click();
      await page.getByRole("button", { name: "Avançar" }).click();

      const updateResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/patients/") &&
          response.request().method() === "PUT",
      );
      await page.getByRole("button", { name: "Salvar" }).click();
      const updateResponse = await updateResponsePromise;
      if (!updateResponse.ok()) {
        const body = await updateResponse.text();
        throw new Error(
          `Falha ao atualizar paciente: ${updateResponse.status()} ${body}`,
        );
      }

      await expect(
        page.getByRole("heading", { name: /editar paciente/i }),
      ).toBeHidden({ timeout: 10_000 });
    });
  });

  test.describe("Exclusão", () => {
    test("exclui paciente pela lista", async ({ page }) => {
      await ensureAuthenticated(page);
      const patientName = await createUniquePatient(page);
      await ensurePatientsPage(page);

      await openPatientMenu(page, patientName);
      await page.getByRole("menuitem", { name: "Excluir" }).click();
      await expect(page.getByText("Confirmar exclusão")).toBeVisible();
      await confirmDeletePatientWithRetry(page);
      await expect(page.getByText("Confirmar exclusão")).toBeHidden({
        timeout: 10_000,
      });
    });
  });
});
