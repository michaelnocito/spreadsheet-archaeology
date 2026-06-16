// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

// SQL track lives in /sql/ and reuses the engine with its own content + the
// renderQuery view. Same walkthrough contract as the Excel smoke test.
const FILE_URL = "file://" + path.resolve(__dirname, "..", "sql", "index.html").replace(/\\/g, "/");

/** Collect uncaught page exceptions — the real signal that something broke. */
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  return errors;
}

test("SQL: full walkthrough — welcome → 10 modules → 5 waves, no runtime errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(FILE_URL);

  await expect(page.locator("#welcome-screen")).toBeVisible();
  await page.evaluate(() => { window.DEV_AUTOREVEAL = true; });
  await page.getByRole("button", { name: /Start Module 1/i }).click();
  await expect(page.locator("#academy-screen")).toBeVisible();

  // Walk the whole Academy via dev.solveStep until the Job screen appears.
  let reachedJob = false;
  for (let i = 0; i < 300; i++) {
    if (await page.locator("#job-screen").isVisible()) { reachedJob = true; break; }
    await page.evaluate(() => window.Academy.dev.solveStep());
  }
  expect(reachedJob, "Academy should graduate into the Job").toBe(true);

  // Walk all 5 waves: auto-reveal selects the answer; clicking primary confirms.
  let finished = false;
  for (let i = 0; i < 80; i++) {
    if (await page.locator("#slice-note").isVisible()) { finished = true; break; }
    await page.locator("#primary").click();
  }
  expect(finished, "All five waves should clear to the slice-complete note").toBe(true);

  expect(errors, "no uncaught runtime errors during the full walkthrough").toEqual([]);
});

test("SQL: a query console renders in a judgment module (M3)", async ({ page }) => {
  watchErrors(page);
  await page.goto(FILE_URL);
  await page.getByRole("button", { name: /Start Module 1/i }).click();
  await page.evaluate(() => window.Academy.jumpToLesson(2)); // M3 Filtering with WHERE
  await page.locator("#a-primary").click(); // intro -> study
  // The teach example is a SQL console (renderQuery).
  await expect(page.locator(".sqlq")).toBeVisible();
  await expect(page.locator(".sqlq-code")).toContainText("WHERE");
  await page.locator("#a-primary").click(); // study -> practice
  await expect(page.locator(".option-card").first()).toBeVisible();
  await page.locator(".option-card").first().click();
  await expect(page.locator("#a-primary")).toBeEnabled();
});
