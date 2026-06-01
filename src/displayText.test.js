import test from "node:test";
import assert from "node:assert/strict";

import { getDisplayText } from "./displayText.js";

test("URL pathから表示文字を取り出す", () => {
  assert.equal(
    getDisplayText(new URL("https://hogehoge.com/%E3%83%87%E3%82%AB%E3%81%84%E6%96%87%E5%AD%97")),
    "デカい文字",
  );
});

test("複数パスはスラッシュ区切りの文字として扱う", () => {
  assert.equal(
    getDisplayText(new URL("https://hogehoge.com/%E3%81%A7%E3%81%8B%E3%81%84/%E6%96%87%E5%AD%97")),
    "でかい/文字",
  );
});

test("ルートは案内文を表示する", () => {
  assert.equal(getDisplayText(new URL("https://hogehoge.com/")), "URLの後ろに文字を入れてください");
});
