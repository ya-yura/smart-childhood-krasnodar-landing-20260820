import { cp, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "github-pages");
const clientRoot = resolve(projectRoot, "dist/client");
const workerUrl = pathToFileURL(resolve(projectRoot, "dist/server/index.js"));
workerUrl.searchParams.set("pages", Date.now().toString());

const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("https://smart-childhood.invalid/", { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) throw new Error(`Static export failed with status ${response.status}`);

await mkdir(outputRoot, { recursive: true });
await cp(clientRoot, outputRoot, { recursive: true, force: true });

let html = await response.text();
html = html
  .replaceAll('="/_next/', '="./_next/')
  .replaceAll('="/hero-atmosphere.webp"', '="./hero-atmosphere.webp"')
  .replaceAll('="/favicon.svg"', '="./favicon.svg"');

await writeFile(resolve(outputRoot, "index.html"), `<!doctype html>${html}`, "utf8");
await writeFile(resolve(outputRoot, ".nojekyll"), "", "utf8");

console.log(`GitHub Pages export written to ${outputRoot}`);
