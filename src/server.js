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
      height: 100%;
      margin: 0;
    }

    body {
      background: #fff;
      color: #000;
      font-family: system-ui, sans-serif;
      overflow: hidden;
      text-align: center;
    }

    main {
      align-items: center;
      box-sizing: border-box;
      display: flex;
      font-size: 10px;
      font-weight: 900;
      height: 100vh;
      justify-content: center;
      line-height: 0.9;
      overflow-wrap: anywhere;
      padding: 0;
      width: 100vw;
    }
  </style>
</head>
<body>
  <main id="dekamoji">${safeText}</main>
  <script>
    const target = document.getElementById("dekamoji");

    function fitText() {
      let min = 1;
      let max = Math.max(window.innerWidth, window.innerHeight) * 2;

      while (max - min > 0.5) {
        const size = (min + max) / 2;
        target.style.fontSize = size + "px";

        if (target.scrollWidth <= window.innerWidth && target.scrollHeight <= window.innerHeight) {
          min = size;
        } else {
          max = size;
        }
      }

      target.style.fontSize = min + "px";
    }

    window.addEventListener("resize", fitText);
    fitText();
  </script>
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
