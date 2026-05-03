import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const extensionDir = join(rootDir, "extension");
const distDir = join(extensionDir, "dist");

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await runTsc();
  await copyStaticFiles();

  process.stdout.write(`Extension build complete: ${distDir}\n`);
}

function runTsc() {
  return new Promise((resolvePromise, rejectPromise) => {
    const tscEntrypoint = join(rootDir, "node_modules", "typescript", "bin", "tsc");
    const child = spawn(
      process.execPath,
      [tscEntrypoint, "-p", "extension/tsconfig.json"],
      {
        cwd: rootDir,
        stdio: "inherit"
      }
    );

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise(undefined);
      } else {
        rejectPromise(new Error(`TypeScript build failed with exit code ${code ?? -1}`));
      }
    });

    child.on("error", rejectPromise);
  });
}

async function copyStaticFiles() {
  await cp(join(extensionDir, "manifest.json"), join(distDir, "manifest.json"));
  await copyDir(join(extensionDir, "src", "popup"), join(distDir, "src", "popup"), [".html", ".css"]);
  await copyDir(join(extensionDir, "src", "sidepanel"), join(distDir, "src", "sidepanel"), [".html", ".css"]);
}

async function copyDir(fromDir, toDir, extensions) {
  await mkdir(toDir, { recursive: true });
  const dirEntries = await readdir(fromDir, { withFileTypes: true });
  const filesToCopy = dirEntries
    .filter((entry) => entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext)))
    .map((entry) => cp(join(fromDir, entry.name), join(toDir, entry.name)));

  await Promise.all(filesToCopy);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
