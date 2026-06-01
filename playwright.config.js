// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/* The game is 100% static and loads from file:// (artifacts are inlined, so
   there's no fetch/CORS). Tests point straight at index.html — no web server. */
module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    headless: true,
    actionTimeout: 5000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
