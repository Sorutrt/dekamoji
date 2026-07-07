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
  assert.match(source, /document\.fonts/);
});

test("ユーザー環境に合わせてダークモード表示に切り替える", () => {
  assert.match(source, /color-scheme: light dark/);
  assert.match(source, /prefers-color-scheme: dark/);
  assert.match(source, /background: #000/);
});

test("colorクエリがあれば文字色として使う", () => {
  assert.match(source, /getDisplayColor\(url\)/);
  assert.match(source, /renderPage\(text, \{ textColor \}\)/);
  assert.match(source, /color: \$\{textColor\};/);
});

test("KaTeXの数式HTMLとCSSを使う", () => {
  assert.match(source, /renderDisplayHtml\(text\)/);
  assert.match(source, /<link rel="stylesheet" href="\/katex\/katex\.min\.css">/);
  assert.match(source, /<main id="dekamoji" data-rainbow="\$\{textColor === null\}">\$\{displayHtml\}<\/main>/);
});

test("KaTeXのCSSとフォントをローカル配信する", () => {
  assert.match(source, /node_modules\/katex\/dist\/katex\.min\.css/);
  assert.match(source, /\/katex\/fonts\//);
  assert.match(source, /serveKatexAsset\(url, response\)/);
});

test("虹色表示ではKaTeXの線とSVGにもグラデーションを使う", () => {
  assert.match(source, /--dekamoji-rainbow: linear-gradient/);
  assert.match(source, /main\[data-rainbow="true"\] \.katex \.frac-line/);
  assert.match(source, /background-position: var\(--dekamoji-rainbow-x, 0\) 0/);
  assert.match(source, /function syncRainbowLines\(mainRect\)/);
  assert.match(source, /gradient\.setAttribute\("gradientUnits", "userSpaceOnUse"\)/);
  assert.match(source, /function syncRainbowSvgs\(mainRect\)/);
  assert.match(source, /Math\.max\(rect\.width \/ viewBox\.width, rect\.height \/ viewBox\.height\)/);
  assert.match(source, /path\.setAttribute\("fill", "url\(#" \+ gradient\.id \+ "\)"\)/);
  assert.match(source, /syncKatexRainbow\(\)/);
  assert.doesNotMatch(source, /--dekamoji-rainbow-fill/);
});
