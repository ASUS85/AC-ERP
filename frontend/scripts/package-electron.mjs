import {
  copyFile,
  access,
  link,
  mkdir,
  mkdtemp,
  readlink,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const electronBuilderCli = require.resolve("electron-builder/cli.js");
const sevenZip = require("7zip-bin");
const nsisDirectory =
  process.env.ELECTRON_BUILDER_NSIS_DIR ??
  join(frontendDir, "node_modules", ".cache", "ac-erp-nsis-3.13");
const appDirectory = join(frontendDir, "release", "win-unpacked");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "ac-erp-package-"));
const stagedAppDirectory = join(temporaryDirectory, "win-unpacked");

async function ensureNsis() {
  try {
    await access(join(nsisDirectory, "Bin", "makensis.exe"));
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const response = await fetch(
    "https://downloads.sourceforge.net/project/nsis/NSIS%203/3.13/nsis-3.13.zip",
  );
  if (!response.ok) {
    throw new Error(`Failed to download NSIS 3.13: ${response.status}`);
  }

  const archive = Buffer.from(await response.arrayBuffer());
  const checksum = createHash("sha256").update(archive).digest("hex");
  if (
    checksum !==
    "ba63dffc4410ee89193e1cb5a41989991bd77c61068da17e3156d136b7b0b3d8"
  ) {
    throw new Error(`NSIS 3.13 checksum mismatch: ${checksum}`);
  }

  const cacheDirectory = dirname(nsisDirectory);
  await mkdir(cacheDirectory, { recursive: true });
  const extractionDirectory = await mkdtemp(
    join(cacheDirectory, "ac-erp-nsis-"),
  );

  try {
    const archivePath = join(extractionDirectory, "nsis-3.13.zip");
    await writeFile(archivePath, archive);

    const result = spawnSync(
      sevenZip.path7za,
      ["x", "-bd", archivePath, `-o${extractionDirectory}`, "-y"],
      { stdio: "inherit" },
    );

    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `NSIS archive extraction failed with exit code ${result.status}`,
      );
    }

    await rename(join(extractionDirectory, "nsis-3.13"), nsisDirectory);
  } finally {
    await rm(extractionDirectory, { recursive: true, force: true });
  }
}

async function stageApp(sourceDirectory, destinationDirectory) {
  await mkdir(destinationDirectory, { recursive: true });

  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = join(sourceDirectory, entry.name);
    const destinationPath = join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      await stageApp(sourcePath, destinationPath);
    } else if (entry.isSymbolicLink()) {
      await symlink(await readlink(sourcePath), destinationPath);
    } else if (relative(appDirectory, sourcePath) === "AC ERP.exe") {
      await copyFile(sourcePath, destinationPath);
    } else {
      try {
        await link(sourcePath, destinationPath);
      } catch (error) {
        if (!["EACCES", "EMLINK", "EPERM", "EXDEV"].includes(error.code)) {
          throw error;
        }
        await copyFile(sourcePath, destinationPath);
      }
    }
  }
}

try {
  await ensureNsis();
  await stageApp(appDirectory, stagedAppDirectory);

  const result = spawnSync(
    process.execPath,
    [electronBuilderCli, "--win", "--prepackaged", stagedAppDirectory],
    {
      cwd: frontendDir,
      env: {
        ...process.env,
        ELECTRON_BUILDER_7ZIP_PATH: sevenZip.path7za,
        ELECTRON_BUILDER_NSIS_DIR: nsisDirectory,
      },
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
