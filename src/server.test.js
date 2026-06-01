import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./server.js", import.meta.url), "utf8");

test("表示領域を画面いっぱいに使う", () => {
  assert.match(source, /width: 100vw/);
  assert.match(source, /height: 100vh/);
});

test("文字サイズを表示領域に合わせて最大化する", () => {
  assert.match(source, /function fitText\(\)/);
  assert.match(source, /scrollWidth <= window\.innerWidth/);
  assert.match(source, /scrollHeight <= window\.innerHeight/);
});
