import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  ".github/workflows/deploy.yml",
  "README.md",
  "admin/index.html",
  "assets/placeholders/linen-lamp.svg",
  "assets/placeholders/thermo-bottle-detail.svg",
  "assets/placeholders/thermo-bottle.svg",
  "assets/scripts/admin.js",
  "assets/scripts/site.js",
  "assets/styles/admin.css",
  "assets/styles/site.css",
  "data/products.json",
  "index.html",
  "package.json",
  "scripts/build-pages.mjs"
];

async function main() {
  await Promise.all(requiredFiles.map(assertExists));

  const raw = await fs.readFile(path.join(root, "data/products.json"), "utf8");
  const data = JSON.parse(raw);

  if (!data.site || typeof data.site !== "object") {
    throw new Error("site metadata is missing in data/products.json");
  }

  assertString(data.site.title ?? "", "site.title");
  assertString(data.site.tagline ?? "", "site.tagline");
  assertString(data.site.currency ?? "", "site.currency");

  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error("products must be a non-empty array");
  }

  const ids = new Set();
  for (const product of data.products) {
    assertString(product.id, "product.id");
    assertString(product.name, `product(${product.id}).name`);

    if (!["active", "draft", "archived"].includes(product.status)) {
      throw new Error(`product(${product.id}).status must be active, draft, or archived`);
    }

    if (ids.has(product.id)) {
      throw new Error(`duplicate product id: ${product.id}`);
    }
    ids.add(product.id);

    assertArray(product.badges ?? [], `product(${product.id}).badges`);
    assertArray(product.gallery ?? [], `product(${product.id}).gallery`);
    assertArray(product.sections ?? [], `product(${product.id}).sections`);

    for (const section of product.sections ?? []) {
      assertString(section.title ?? "", `product(${product.id}).sections[].title`);
      assertString(section.content ?? "", `product(${product.id}).sections[].content`);
    }

    if (product.status !== "active") {
      continue;
    }

    assertString(product.summary ?? "", `product(${product.id}).summary`);
    assertString(product.cover ?? "", `product(${product.id}).cover`);
    assertString(product.orderLink ?? "", `product(${product.id}).orderLink`);
  }

  await Promise.all([
    parseScript("assets/scripts/site.js"),
    parseScript("assets/scripts/admin.js"),
    parseScript("scripts/build-pages.mjs")
  ]);

  await import(pathToFileURL(path.join(root, "scripts/build-pages.mjs")).href);
  await assertAdminNotPublished();

  console.log("Validation passed");
}

async function parseScript(relativePath) {
  const source = await fs.readFile(path.join(root, relativePath), "utf8");
  const transformed = source
    .replace(/^import\s+.+?from\s+["'].+?["'];?\s*$/gms, "")
    .replaceAll("import.meta.url", '"file:///mock.js"');

  try {
    new Function(transformed);
  } catch (error) {
    throw new Error(`${relativePath} has invalid syntax: ${error.message}`);
  }
}

async function assertExists(relativePath) {
  const target = path.join(root, relativePath);
  await fs.access(target);
}

async function assertAdminNotPublished() {
  try {
    await fs.access(path.join(root, "dist-pages", "admin"));
    throw new Error("dist-pages/admin must not exist");
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function assertString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
