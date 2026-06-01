// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

const FILE_URL = "file://" + path.resolve(__dirname, "..", "index.html").replace(/\\/g, "/");

/** Collect uncaught page exceptions — the real signal that something broke. */
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  return errors;
}

test("full walkthrough — welcome → 10 modules → 5 waves, no runtime errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(FILE_URL);

  // Welcome screen
  await expect(page.locator("#welcome-screen")).toBeVisible();
  await page.evaluate(() => { window.DEV_AUTOREVEAL = true; });
  await page.getByRole("button", { name: /Start Module 1/i }).click();
  await expect(page.locator("#academy-screen")).toBeVisible();

  // Walk the whole Academy: dev.solveStep advances one stage per call and, on a
  // practice step, picks the correct answer. Loop until the Job screen appears.
  let reachedJob = false;
  for (let i = 0; i < 300; i++) {
    if (await page.locator("#job-screen").isVisible()) { reachedJob = true; break; }
    await page.evaluate(() => window.Academy.dev.solveStep());
  }
  expect(reachedJob, "Academy should graduate into the Job").toBe(true);

  // Walk all 5 waves: auto-reveal selects the answer in boot(); clicking the
  // primary confirms (win) then advances to the next file. Stop at slice-note.
  let finished = false;
  for (let i = 0; i < 80; i++) {
    if (await page.locator("#slice-note").isVisible()) { finished = true; break; }
    await page.locator("#primary").click();
  }
  expect(finished, "All five waves should clear to the slice-complete note").toBe(true);

  expect(errors, "no uncaught runtime errors during the full walkthrough").toEqual([]);
});

test("orientation backbone — the ask + the directive are always visible (Academy)", async ({ page }) => {
  watchErrors(page);
  await page.goto(FILE_URL);
  await page.getByRole("button", { name: /Start Module 1/i }).click();
  // Intro stage: both the ask and the directive should be present + visible.
  await expect(page.locator("#a-brief-ask")).toBeVisible();
  await expect(page.locator("#a-brief-task")).toBeVisible();
  await expect(page.locator("#a-brief-ask")).toContainText(/the ask/i);

  // Advance to the Study (teach) step — still no-click, but a real directive shows.
  await page.locator("#a-primary").click();
  await expect(page.locator("#a-brief-task")).toContainText(/Got it/i);
  // The renamed step label should read "Study", never "Watch".
  await expect(page.locator("#a-stepper")).toContainText("Study");
  await expect(page.locator("#a-stepper")).not.toContainText("Watch");
});

test("select_option renders clickable choices in a judgment module (M6)", async ({ page }) => {
  watchErrors(page);
  await page.goto(FILE_URL);
  // Jump straight to Module 6 (index 5) via the flow's lesson entry point.
  await page.evaluate(() => window.Academy && null);
  await page.getByRole("button", { name: /Start Module 1/i }).click();
  await page.evaluate(() => window.Academy.jumpToLesson(5)); // M6 Source vs. copy
  // intro -> study -> first practice rep
  await page.locator("#a-primary").click(); // intro -> study
  await page.locator("#a-primary").click(); // study -> practice
  await expect(page.locator(".option-card")).toHaveCount(3);
  // Picking an option should enable Confirm.
  await page.locator(".option-card").first().click();
  await expect(page.locator("#a-primary")).toBeEnabled();
});
