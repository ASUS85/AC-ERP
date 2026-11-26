import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const viteCli = join(frontendDir, "node_modules", "vite", "bin", "vite.js");
const env = { ...process.env };
let temporaryDirectory;

if (process.platform === "win32") {
  const esbuildPackage = require.resolve("esbuild/package.json", {
    paths: [join(frontendDir, "node_modules", "vite")],
  });
  const esbuildBinary = join(
    dirname(dirname(esbuildPackage)),
    "@esbuild",
    `win32-${process.arch}`,
    "esbuild.exe",
  );
  temporaryDirectory = await mkdtemp(join(tmpdir(), "ac-erp-esbuild-"));
  const temporaryBinary = join(temporaryDirectory, "esbuild.exe");
  await copyFile(esbuildBinary, temporaryBinary);
  env.ESBUILD_BINARY_PATH = temporaryBinary;
}

try {
  const result = spawnSync(
    process.execPath,
    [viteCli, "build", "--mode", "electron"],
    { cwd: frontendDir, env, stdio: "inherit" },
  );

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
