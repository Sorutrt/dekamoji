import http from "node:http";

import { getDisplayText } from "./displayText.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPage(text) {
  const safeText = escapeHtml(text);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeText}</title>
  <style>
    html,
    body {
      margin: 0;
      min-height: 100%;
    }

    body {
      align-items: center;
      background: #fff;
      color: #000;
      display: flex;
      font-family: system-ui, sans-serif;
      justify-content: center;
      min-height: 100vh;
      overflow-wrap: anywhere;
      padding: 4vw;
      text-align: center;
    }

    main {
      font-size: clamp(4rem, 20vw, 18rem);
      font-weight: 900;
      line-height: 0.9;
      max-width: 100%;
    }
  </style>
</head>
<body>
  <main>${safeText}</main>
</body>
</html>`;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const text = getDisplayText(url);

  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(renderPage(text));
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
