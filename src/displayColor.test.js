import test from "node:test";
import assert from "node:assert/strict";

import { getDisplayColor } from "./displayColor.js";

test("colorクエリは16進6桁を文字色として扱う", () => {
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=ff00aa")), "#ff00aa");
});

test("colorクエリは16進3桁を文字色として扱う", () => {
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=f0a")), "#f0a");
});

test("colorクエリはURLエンコードされた#始まりも受け付ける", () => {
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=%23FF00AA")), "#ff00aa");
});

test("colorクエリがない、または16進3桁/6桁でなければ文字色を指定しない", () => {
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字")), null);
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=")), null);
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=red")), null);
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=ff00")), null);
  assert.equal(getDisplayColor(new URL("https://hogehoge.com/文字?color=ff00aaz")), null);
});
