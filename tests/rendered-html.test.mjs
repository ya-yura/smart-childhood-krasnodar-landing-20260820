import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Умное детство — развитие детей в Краснодаре<\/title>/i);
  assert.match(html, /Развитие ребёнка/);
  assert.match(html, /Подобрать направление/);
  assert.match(html, /Подготовка к школе/);
  assert.match(html, /Монтессори/);
  assert.match(html, /Скорочтение/);
  assert.match(html, /Творчество/);
  assert.match(html, /Продлёнка/);
  assert.match(html, /hero-atmosphere\.webp/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview|SkeletonPreview|Starter Project/i);
});
