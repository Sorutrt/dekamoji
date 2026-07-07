import test from "node:test";
import assert from "node:assert/strict";

import { renderDisplayHtml } from "./displayHtml.js";

test("$...$をインライン数式として表示する", () => {
  const html = renderDisplayHtml("面積は $S=ab$");

  assert.match(html, /面積は /);
  assert.match(html, /class="katex"/);
  assert.match(html, /<annotation encoding="application\/x-tex">S=ab<\/annotation>/);
});

test("$$...$$をディスプレイ数式として表示する", () => {
  const html = renderDisplayHtml("$$E=mc^2$$");

  assert.match(html, /class="katex-display"/);
  assert.match(html, /<annotation encoding="application\/x-tex">E=mc\^2<\/annotation>/);
});

test("\\(...\\)をインライン数式、\\[...\\]をディスプレイ数式として表示する", () => {
  const inlineHtml = renderDisplayHtml("\\(x^2\\)");
  const displayHtml = renderDisplayHtml("\\[x^2\\]");

  assert.match(inlineHtml, /class="katex"/);
  assert.doesNotMatch(inlineHtml, /class="katex-display"/);
  assert.match(displayHtml, /class="katex-display"/);
});

test("URLパスで/になったLaTeXコマンドは数式内だけバックスラッシュとして扱う", () => {
  const html = renderDisplayHtml("$/frac{1}{2}$");

  assert.match(html, /<annotation encoding="application\/x-tex">\\frac\{1\}\{2\}<\/annotation>/);
});

test("URLパスで//になったLaTeXの改行は数式内だけ\\\\として扱う", () => {
  const html = renderDisplayHtml("$/begin{bmatrix}a && b // c && d/end{bmatrix}$");

  assert.match(
    html,
    /<annotation encoding="application\/x-tex">\\begin\{bmatrix\}a &amp;&amp; b \\\\ c &amp;&amp; d\\end\{bmatrix\}<\/annotation>/,
  );
  assert.match(html, /<mtable/);
  assert.match(html, /<mtr>.*<mi>a<\/mi>.*<mi>b<\/mi>.*<\/mtr><mtr>.*<mi>c<\/mi>.*<mi>d<\/mi>.*<\/mtr>/);
});

test("URLパスで/になった\\(...\\)と\\[...\\]の区切りも数式として扱う", () => {
  const inlineHtml = renderDisplayHtml("/(x^2/)");
  const displayHtml = renderDisplayHtml("/[x^2/]");

  assert.match(inlineHtml, /class="katex"/);
  assert.doesNotMatch(inlineHtml, /class="katex-display"/);
  assert.match(displayHtml, /class="katex-display"/);
});

test("数式外のスラッシュは通常テキストとして残す", () => {
  assert.equal(renderDisplayHtml("でかい/文字"), "でかい/文字");
});

test("閉じていない区切りは通常テキストとして扱う", () => {
  assert.equal(renderDisplayHtml("$x^2"), "$x^2");
});

test("通常テキスト部分はHTMLエスケープする", () => {
  const html = renderDisplayHtml("<script>$x$</script>");

  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
