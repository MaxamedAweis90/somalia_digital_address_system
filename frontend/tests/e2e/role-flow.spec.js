import { test, expect } from "@playwright/test";

const PASSWORD = "Password123!";
const ACCOUNTS = {
  admin: {
    email: "admin@somalia.gov.so",
    homePath: "/admin/dashboard",
  },
  officer: {
    email: "officer@somalia.gov.so",
    homePath: "/officer/dashboard",
  },
  collector: {
    email: "collector1@somalia.gov.so",
    homePath: "/collector/dashboard",
  },
};

async function login(page, account) {
  await page.goto("/login");
  await page.getByLabel("Official Email").fill(account.email);
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/ }).click();
  await expect(page).toHaveURL(new RegExp(`${account.homePath}$`));
}

async function selectOptionContaining(select, text) {
  const option = select.locator("option").filter({ hasText: text }).first();
  await expect(option).toHaveCount(1);
  await select.selectOption(await option.getAttribute("value"));
}

test("admin, officer, and collector complete one field-work flow", async ({ browser }) => {
  test.setTimeout(180_000);

  // Each role gets one browser context and one login. The contexts stay alive
  // so later steps can return to the admin or officer without logging in again.
  const adminContext = await browser.newContext();
  const officerContext = await browser.newContext();
  const collectorContext = await browser.newContext();
  const admin = await adminContext.newPage();
  const officer = await officerContext.newPage();
  const collector = await collectorContext.newPage();

  try {
    const assignmentNote = `Playwright role flow ${Date.now()}`;

    // Admin: create a parent address-registration assignment for one collector.
    await login(admin, ACCOUNTS.admin);
    await admin.goto("/admin/assignments/add");
    await expect(admin.getByRole("heading", { name: "New Assignment" })).toBeVisible();

    await admin.locator('select[name="type"]').selectOption("REGISTER_ADDRESSES");
    await expect(admin.locator('select[name="zoneBlockId"]')).toBeVisible();
    await selectOptionContaining(admin.locator('select[name="zoneBlockId"]'), "Z01");
    await selectOptionContaining(
      admin.locator('select[name="assignedToId"]'),
      ACCOUNTS.officer.email
    );
    await admin.locator('input[name="expectedCollectorCount"]').fill("1");
    await admin.locator('textarea[name="notes"]').fill(assignmentNote);
    const createAssignmentResponse = admin.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/api/v1/admin/assignments")
    );
    await admin.getByRole("button", { name: "Create Assignment" }).click();
    const createdAssignment = await (await createAssignmentResponse).json();
    const parentId = createdAssignment.data?.id || createdAssignment.data?.data?.id;
    expect(parentId).toBeTruthy();
    await expect(admin).toHaveURL(/\/admin\/assignments\/[^/]+$/);
    await expect(admin.getByText(assignmentNote)).toBeVisible();

    // Officer: open the parent and delegate its one child task.
    await login(officer, ACCOUNTS.officer);
    await officer.goto(`/officer/assignments/${parentId}`);
    await expect(
      officer.getByRole("heading", { name: "Supervise Field Assignment" })
    ).toBeVisible();
    await officer.getByRole("button", { name: "Delegate to Collector" }).click();

    const delegationForm = officer.locator("form").filter({ hasText: "Delegate Child Task" });
    await expect(delegationForm).toBeVisible();
    await delegationForm.locator("select").selectOption({ index: 0 });
    await delegationForm.getByRole("button", { name: "Create Task" }).click();
    await expect(officer.getByText("Collector Tasks")).toBeVisible();

    const collectorRow = officer
      .getByRole("row")
      .filter({ hasText: "Amina Collector" });
    await expect(collectorRow).toBeVisible();
    await collectorRow.getByRole("button", { name: /View|Review/ }).click();
    await expect(officer).toHaveURL(/\/officer\/children\/[^/]+$/);
    const childId = new URL(officer.url()).pathname.split("/").pop();

    // Collector: add one address, place its pin, and submit to the officer.
    await login(collector, ACCOUNTS.collector);
    await collector.goto(`/collector/assignments/${childId}`);
    await expect(
      collector.getByRole("heading", { name: "Register Zone Block Addresses" })
    ).toBeVisible();
    await collector.getByRole("button", { name: "Add", exact: true }).click();

    await collector
      .getByText("Street Name", { exact: true })
      .locator("..")
      .locator("input")
      .fill("Playwright Test Street");
    await collector
      .getByText("Description", { exact: true })
      .locator("..")
      .locator("textarea")
      .fill("Playwright role-flow test address");

    const map = collector.locator(".leaflet-container");
    await expect(map).toBeVisible();
    const mapBox = await map.boundingBox();
    expect(mapBox).not.toBeNull();
    await map.click({
      position: {
        x: Math.round(mapBox.width / 2),
        y: Math.round(mapBox.height / 2),
      },
    });

    await collector.getByRole("button", { name: "Submit for Approval" }).click();
    await collector.getByRole("button", { name: "Submit to Officer" }).click();
    await expect(
      collector.getByText("Assignment submitted to your data officer.")
    ).toBeVisible();

    // Officer: review and approve the collector submission, then merge it.
    await officer.goto(`/officer/children/${childId}`);
    await officer
      .getByRole("button", { name: "Approve & Register Addresses" })
      .first()
      .click();
    await officer
      .getByRole("button", { name: "Approve & Register Addresses" })
      .last()
      .click();
    await expect(officer.getByText("Child assignment approved.")).toBeVisible();

    await officer.goto(`/officer/assignments/${parentId}`);
    await officer.getByRole("button", { name: "Merge Approved Work" }).click();
    await expect(
      officer.getByText("Approved child work merged into parent assignment.")
    ).toBeVisible();
    await officer.getByRole("button", { name: "Submit to Admin" }).click();
    await officer.getByRole("button", { name: "Submit to Admin" }).last().click();
    await expect(
      officer.getByText("Parent assignment submitted to admin for approval.")
    ).toBeVisible();

    // Admin: approve the merged parent and publish the address.
    await admin.goto(`/admin/assignments/${parentId}`);
    await admin
      .getByRole("button", { name: "Approve & Register Addresses" })
      .first()
      .click();
    await admin
      .getByRole("button", { name: "Approve & Register Addresses" })
      .last()
      .click();
    await expect(
      admin.getByText("Assignment approved and addresses registered.")
    ).toBeVisible();
  } finally {
    await Promise.all([
      adminContext.close(),
      officerContext.close(),
      collectorContext.close(),
    ]);
  }
});
