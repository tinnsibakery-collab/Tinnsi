const path = require("path");
const { defineConfig } = require("@playwright/test");

const serverScript = path.join(__dirname, "scripts", "serve-local.ps1");

module.exports = defineConfig({
  testDir: path.join(__dirname, "tests"),
  timeout: 120000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }]
  ],
  use: {
    acceptDownloads: true,
    baseURL: "http://127.0.0.1:4173",
    channel: "msedge",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: {
    command: `powershell.exe -ExecutionPolicy Bypass -File "${serverScript}" -Port 4173`,
    reuseExistingServer: true,
    timeout: 120000,
    url: "http://127.0.0.1:4173/"
  }
});
