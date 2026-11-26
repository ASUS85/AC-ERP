// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "vite";
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig(async (configEnv) => {
  const isElectron = configEnv.mode === "electron";
  const lovableConfig = defineLovableConfig({
    nitro: isElectron ? false : { preset: "node-server" },
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      ...(isElectron
        ? {
            spa: {
              enabled: true,
              maskPath: "/",
              prerender: { outputPath: "/index" },
            },
          }
        : {}),
    },
    ...(isElectron
      ? {
          vite: {
            build: { outDir: "dist" },
            environments: { client: { build: { outDir: "dist" } } },
          },
        }
      : {}),
  });

  return {
    ...(await lovableConfig(configEnv)),
    base: isElectron ? "./" : "/",
  };
});
