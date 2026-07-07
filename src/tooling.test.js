import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const serverSource = readFileSync(new URL("./server.js", import.meta.url), "utf8");

test("npmスクリプトはmise経由のNodeを要求する", () => {
  assert.equal(packageJson.scripts.preinstall, "node scripts/ensure-mise-node.js");
  assert.equal(packageJson.scripts.prestart, "node scripts/ensure-mise-node.js");
  assert.equal(packageJson.scripts.pretest, "node scripts/ensure-mise-node.js");
});

test("サーバーを直接起動した場合もmise経由のNodeを要求する", () => {
  assert.match(serverSource, /import "\.\.\/scripts\/ensure-mise-node\.js";/);
});
