import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  console.log(manifest)
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    sourcemap: true,
    minify: false,
  },
  plugins: [
    svelte(),
    webExtension({
      browser: "firefox",
      manifest: generateManifest,
      watchFilePaths: ["package.json", "src/manifest.json", "src/content.ts"],
    }),
  ],
});
