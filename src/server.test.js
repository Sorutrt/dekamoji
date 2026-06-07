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
  assert.match(source, /scrollWidth <= target\.clientWidth/);
  assert.match(source, /scrollHeight <= target\.clientHeight/);
});

test("スマホの動的ビューポートに合わせて表示領域を決める", () => {
  assert.match(source, /viewport-fit=cover/);
  assert.match(source, /100dvh/);
  assert.match(source, /window\.visualViewport/);
});

test("ユーザー環境に合わせてダークモード表示に切り替える", () => {
  assert.match(source, /color-scheme: light dark/);
  assert.match(source, /prefers-color-scheme: dark/);
  assert.match(source, /background: #000/);
});
