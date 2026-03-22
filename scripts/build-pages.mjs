import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist-pages");

async function main() {
  await fs.rm(output, { recursive: true, force: true });

  // Publish both the storefront and the browser admin to GitHub Pages.
  await copyFile("index.html");
  await copyDirectory("admin");
  await copyDirectory("data");
  await copyDirectory("assets");
}

async function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(output, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

async function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(output, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
