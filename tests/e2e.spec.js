const fs = require("fs/promises");
const path = require("path");
const { test, expect } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "..");
const githubOwner = process.env.TINNSI_GITHUB_OWNER || "tinnsibakery-collab";
const githubRepo = process.env.TINNSI_GITHUB_REPO || "Tinnsi";
const githubBaseBranch = process.env.TINNSI_GITHUB_BASE_BRANCH || "main";
const githubToken = process.env.TINNSI_GITHUB_TOKEN || "";

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function encodeRepoPath(filePath) {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

function buildGitHubHeaders(includeJsonBody = false) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Tinnsi-Playwright"
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }
  if (includeJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildGitHubHeaders(options.body !== undefined),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }

  return response;
}

async function getBranchHeadSha(branch) {
  const response = await githubRequest(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/branches/${encodeURIComponent(branch)}`
  );
  const data = await response.json();
  return data.commit.sha;
}

async function createTempBranch() {
  const branch = `codex/e2e-${uniqueSuffix()}`;
  const baseSha = await getBranchHeadSha(githubBaseBranch);

  await githubRequest(`https://api.github.com/repos/${githubOwner}/${githubRepo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseSha
    })
  });

  return branch;
}

async function deleteBranch(branch) {
  try {
    await githubRequest(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/refs/heads/${encodeURIComponent(branch)}`,
      { method: "DELETE" }
    );
  } catch (error) {
    if (!String(error.message || "").startsWith("404 ")) {
      throw error;
    }
  }
}

async function getRepoFile(filePath, branch) {
  const response = await githubRequest(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${encodeRepoPath(filePath)}?ref=${encodeURIComponent(branch)}`
  );
  return response.json();
}

async function getRepoJson(filePath, branch) {
  const file = await getRepoFile(filePath, branch);
  const content = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
  return JSON.parse(content);
}

async function getBlobJson(sha) {
  const response = await githubRequest(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/blobs/${sha}`
  );
  const blob = await response.json();
  const content = Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf8");
  return JSON.parse(content);
}

async function getBlobMetadata(sha) {
  const response = await githubRequest(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/blobs/${sha}`
  );
  return response.json();
}

async function readLocalCatalog() {
  return JSON.parse(
    await fs.readFile(path.join(repoRoot, "data", "products.json"), "utf8")
  );
}

async function restoreLocalCatalog(page, payload) {
  await page.request.post("/_desktop/auto-publish", {
    data: { enabled: false }
  });
  await page.request.post("/_desktop/settings", {
    data: {
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBaseBranch,
      publishNote: "desktop auto publish"
    }
  });
  await page.request.post("/_desktop/snapshot", {
    data: payload
  });
  if (!page.isClosed()) {
    await page.goto("/admin/");
    await page.waitForLoadState("domcontentloaded");
  }
  await page.request.post("/_desktop/auto-publish", {
    data: { enabled: true }
  });
}

async function fillGitHubSettings(page, branch) {
  await ensureGitHubPanelVisible(page);

  await page.locator("#github-owner").fill(githubOwner);
  await page.locator("#github-repo").fill(githubRepo);
  await page.locator("#github-branch").fill(branch);
  const tokenField = page.locator("#github-token");
  if (await tokenField.isVisible().catch(() => false)) {
    await tokenField.fill(githubToken);
  }
}

async function ensureGitHubPanelVisible(page) {
  const githubForm = page.locator("#github-form");
  if (await githubForm.isHidden().catch(() => false)) {
    await page.locator("#github-panel-toggle").click();
    await expect(githubForm).toBeVisible();
  }
}

test("storefront lets shoppers filter and inspect products", async ({ page }) => {
  await page.goto("/");

  const cards = page.locator("#product-grid .product-card");
  await expect(cards).toHaveCount(2);
  await expect(page.locator("#product-detail")).toBeVisible();

  await page.locator("#search-input").fill("Aurora");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Aurora");

  await page.locator("#search-input").fill("");
  await page.getByRole("button", { name: "Living" }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Linen");

  await cards.first().locator(".product-card-detail").click();
  await expect(page.locator("#detail-name")).toContainText("Linen");
  await expect(page.locator("#detail-order-link")).toHaveAttribute("href", /docs\.google\.com/);
});

test("admin supports local editing, backup download, and backup import", async ({ page }) => {
  const originalPayload = await readLocalCatalog();
  await page.request.post("/_desktop/auto-publish", {
    data: { enabled: false }
  });

  try {
    await page.goto("/admin/");
    await expect(page.locator("#publish-shortcut-button")).toBeVisible();
    await expect(page.locator("#theme-editor")).toBeVisible();

    const productItems = page.locator("#product-list .product-item");
    await expect(productItems).toHaveCount(2);

    await page.locator("#add-product").click();
    await expect(productItems).toHaveCount(3);

    await page.locator("#product-name").fill("Automation Draft");
    await page.locator("#duplicate-product").click();
    await expect(productItems).toHaveCount(4);

    page.on("dialog", (dialog) => dialog.accept());
    await page.locator("#delete-product").click();
    await expect(productItems).toHaveCount(3);

    const sections = page.locator("#sections-editor .section-item");
    const initialSectionCount = await sections.count();
    await page.locator("#add-section").click();
    await expect(sections).toHaveCount(initialSectionCount + 1);

    const accentHex = page.locator('.theme-hex[data-theme-key="accent"]');
    await accentHex.fill("#145B59");
    await expect(accentHex).toHaveValue("#145B59");

    await ensureGitHubPanelVisible(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#download-backup").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("products-backup.json");

    const importPayload = structuredClone(originalPayload);
    importPayload.site.title = `Playwright Import ${uniqueSuffix()}`;

    const importPath = test.info().outputPath("import-backup.json");
    await fs.writeFile(importPath, `${JSON.stringify(importPayload, null, 2)}\n`, "utf8");
    await page.setInputFiles("#import-backup", importPath);

    await expect(page.locator("#site-title-input")).toHaveValue(importPayload.site.title);
  } finally {
    await restoreLocalCatalog(page, originalPayload);
  }
});

test.describe("GitHub integration", () => {
  test.describe.configure({ mode: "serial", timeout: 180000 });

  test.skip(!githubToken, "Set TINNSI_GITHUB_TOKEN to run GitHub integration tests.");

  test("admin can load GitHub data and publish catalog updates to a temp branch", async ({ page }) => {
    const originalPayload = await readLocalCatalog();
    const branch = await createTempBranch();
    const markerEmail = `playwright-${uniqueSuffix()}@example.test`;
    const themeAccent = "#145B59";

    try {
      await page.goto("/admin/");
      await fillGitHubSettings(page, branch);

      await Promise.all([
        page.waitForResponse((response) =>
          response.request().method() === "GET" &&
          response.status() === 200 &&
          response.url() === `https://api.github.com/repos/${githubOwner}/${githubRepo}`
        ),
        page.waitForResponse((response) =>
          response.request().method() === "GET" &&
          response.status() === 200 &&
          response.url().includes(`/branches/${encodeURIComponent(branch)}`)
        ),
        page.locator("#test-connection").click()
      ]);

      await Promise.all([
        page.waitForResponse((response) =>
          response.request().method() === "GET" &&
          response.status() === 200 &&
          response.url().includes("/contents/data/products.json")
        ),
        page.locator("#load-repo").click()
      ]);

      await page.locator("#site-contact-input").fill(markerEmail);
      await expect(page.locator("#site-contact-input")).toHaveValue(markerEmail);
      await page.locator('.theme-hex[data-theme-key="accent"]').fill(themeAccent);

      await Promise.all([
        page.waitForResponse((response) =>
          (
            response.request().method() === "PUT" &&
            response.status() === 200 &&
            response.url().endsWith("/contents/data/products.json")
          ) ||
          (
            response.request().method() === "POST" &&
            response.status() === 200 &&
            response.url().endsWith("/_desktop/snapshot")
          )
        ),
        page.locator("#publish-shortcut-button").click()
      ]);

      await expect
        .poll(async () => {
          const remoteJson = await getRepoJson("data/products.json", branch);
          return {
            contactEmail: remoteJson.site.contactEmail,
            accent: remoteJson.site.theme?.accent
          };
        })
        .toEqual({
          contactEmail: markerEmail,
          accent: themeAccent
        });
    } finally {
      await restoreLocalCatalog(page, originalPayload);
      await deleteBranch(branch);
    }
  });

  test("admin can upload an image to a temp branch", async ({ page }) => {
    const originalPayload = await readLocalCatalog();
    const branch = await createTempBranch();
    const sampleImage = path.join(repoRoot, "assets", "placeholders", "linen-lamp.svg");

    try {
      await page.goto("/admin/");
      await fillGitHubSettings(page, branch);

      await Promise.all([
        page.waitForResponse((response) =>
          response.request().method() === "GET" &&
          response.status() === 200 &&
          response.url().includes("/contents/data/products.json")
        ),
        page.locator("#load-repo").click()
      ]);

      await page.setInputFiles("#image-input", sampleImage);

      await Promise.all([
        page.waitForResponse((response) =>
          (
            response.request().method() === "PUT" &&
            response.status() >= 200 &&
            response.status() < 300 &&
            response.url().includes("/contents/assets/products/")
          ) ||
          (
            response.request().method() === "POST" &&
            response.status() === 200 &&
            response.url().endsWith("/_desktop/upload-image")
          )
        ),
        page.locator("#upload-images").click()
      ]);

      const uploadedPath = await page.locator("#product-cover").inputValue();
      expect(uploadedPath).toContain("assets/products/");

      const previewState = await page.locator("#gallery-preview img").first().evaluate((img) => ({
        currentSrc: img.currentSrc,
        naturalWidth: img.naturalWidth
      }));
      expect(previewState.currentSrc).toContain("/assets/products/");
      expect(previewState.currentSrc).not.toContain("/admin/assets/");
      expect(previewState.naturalWidth).toBeGreaterThan(0);

      const remoteFile = await getRepoFile(uploadedPath, branch);
      const remoteBlob = await getBlobMetadata(remoteFile.sha);
      expect(remoteBlob.size).toBeGreaterThan(0);

      await expect
        .poll(async () => {
          const remoteJson = await getRepoJson("data/products.json", branch);
          return remoteJson.products.some((product) => product.cover === uploadedPath);
        })
        .toBe(true);
    } finally {
      await restoreLocalCatalog(page, originalPayload);
      await deleteBranch(branch);
    }
  });
});
