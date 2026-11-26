import { readFile, writeFile } from "node:fs/promises";

const indexUrl = new URL("../dist/index.html", import.meta.url);
const html = await readFile(indexUrl, "utf8");
const relativeHtml = html.replace(/(["'])\/\.\/assets\//g, "$1./assets/");

if (relativeHtml !== html) {
  await writeFile(indexUrl, relativeHtml);
}
