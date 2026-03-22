import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist-pages");

async function main() {
  await fs.rm(output, { recursive: true, force: true });

  // Keep admin/ in the repository, but never publish it to GitHub Pages.
  await copyFile("index.html");
  await copyDirectory("data");
  await copyFile("assets/styles/site.css");
  await copyFile("assets/scripts/site.js");
  await copyDirectory("assets/placeholders");
  await copyDirectoryIfExists("assets/products");
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

async function copyDirectoryIfExists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    await copyDirectory(relativePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
