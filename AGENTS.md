# Rules for AI

- このリポジトリで Node.js / npm / npx / node を実行する場合は、必ず `mise exec -- ...` 経由で実行する。
- 例: `mise exec -- npm test`, `mise exec -- npm ci`, `mise exec -- node src/server.js`
- `npm` コマンドに tokf が必要な場合は、`mise exec -- tokf run npm test` のように `mise exec --` を外側に置く。
- `node`, `npm`, `npx` を直接実行して失敗した場合は、同じ目的の再実行前に `mise exec -- ...` に直す。
