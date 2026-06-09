import http from "node:http";

import { getDisplayColor } from "./displayColor.js";
import { getDisplayText } from "./displayText.js";

const port = Number.parseInt(process.env.PORT ?? "3050", 10);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getMainTextStyle(textColor) {
  if (textColor !== null) {
    return `      color: ${textColor};`;
  }

  return `      background: linear-gradient(to right,#e60000,#f39800,#fff100,#009944,#0068b7,#1d2088,#920783);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;`;
}

function renderPage(text, { textColor = null } = {}) {
  const safeText = escapeHtml(text);
  const mainTextStyle = getMainTextStyle(textColor);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${safeText}</title>
  <style>
    :root {
      color-scheme: light dark;
      --viewport-height: 100vh;
      --viewport-width: 100vw;
    }

    @supports (height: 100dvh) {
      :root {
        --viewport-height: 100dvh;
        --viewport-width: 100dvw;
      }
    }

    html,
    body {
      height: 100%;
      margin: 0;
    }

    body {
      background: #fff;
      font-family: system-ui, sans-serif;
      overflow: hidden;
      text-align: center;
    }

    main {
${mainTextStyle}

      align-items: center;
      box-sizing: border-box;
      display: flex;
      font-size: 10px;
      font-weight: 900;
      height: var(--viewport-height);
      justify-content: center;
      line-height: 0.9;
      overflow-wrap: anywhere;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
      width: var(--viewport-width);
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #000;
      }
    }
  </style>
</head>
<body>
  <main id="dekamoji">${safeText}</main>
  <script>
    const target = document.getElementById("dekamoji");

    function syncViewportSize() {
      const viewport = window.visualViewport;
      const width = viewport ? viewport.width : window.innerWidth;
      const height = viewport ? viewport.height : window.innerHeight;

      document.documentElement.style.setProperty("--viewport-width", width + "px");
      document.documentElement.style.setProperty("--viewport-height", height + "px");
    }

    function fitText() {
      syncViewportSize();

      let min = 1;
      let max = Math.max(target.clientWidth, target.clientHeight) * 2;

      while (max - min > 0.5) {
        const size = (min + max) / 2;
        target.style.fontSize = size + "px";

        if (target.scrollWidth <= target.clientWidth && target.scrollHeight <= target.clientHeight) {
          min = size;
        } else {
          max = size;
        }
      }

      target.style.fontSize = min + "px";
    }

    window.addEventListener("resize", fitText);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", fitText);
    }
    fitText();
  </script>
</body>
</html>`;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const text = getDisplayText(url);
  const textColor = getDisplayColor(url);

  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(renderPage(text, { textColor }));
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
