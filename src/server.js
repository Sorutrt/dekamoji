import "../scripts/ensure-mise-node.js";

import http from "node:http";
import { createReadStream } from "node:fs";

import { getDisplayColor } from "./displayColor.js";
import { escapeHtml, renderDisplayHtml } from "./displayHtml.js";
import { getDisplayText } from "./displayText.js";

const port = Number.parseInt(process.env.PORT ?? "3050", 10);

const KATEX_CSS_URL = new URL("../node_modules/katex/dist/katex.min.css", import.meta.url);
const KATEX_FONT_PATTERN = /^\/katex\/fonts\/[A-Za-z0-9_-]+\.(?:woff2?|ttf)$/;
const KATEX_FONT_CONTENT_TYPES = {
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMainTextStyle(textColor) {
  if (textColor !== null) {
    return `      color: ${textColor};`;
  }

  return `      background: var(--dekamoji-rainbow);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;`;
}

function renderPage(text, { textColor = null } = {}) {
  const safeText = escapeHtml(text);
  const displayHtml = renderDisplayHtml(text);
  const mainTextStyle = getMainTextStyle(textColor);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${safeText}</title>
  <link rel="stylesheet" href="/katex/katex.min.css">
  <style>
    :root {
      color-scheme: light dark;
      --dekamoji-rainbow: linear-gradient(to right,#e60000,#f39800,#fff100,#009944,#0068b7,#1d2088,#920783);
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

    main[data-rainbow="true"] .katex .frac-line,
    main[data-rainbow="true"] .katex .overline-line,
    main[data-rainbow="true"] .katex .underline-line {
      background-image: var(--dekamoji-rainbow);
      background-position: var(--dekamoji-rainbow-x, 0) 0;
      background-repeat: no-repeat;
      background-size: var(--dekamoji-rainbow-width, var(--viewport-width)) 100%;
      border-bottom-color: transparent;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #000;
      }
    }
  </style>
</head>
<body>
  <main id="dekamoji" data-rainbow="${textColor === null}">${displayHtml}</main>
  <script>
    const target = document.getElementById("dekamoji");
    const rainbowStops = [
      ["0%", "#e60000"],
      ["16.67%", "#f39800"],
      ["33.33%", "#fff100"],
      ["50%", "#009944"],
      ["66.67%", "#0068b7"],
      ["83.33%", "#1d2088"],
      ["100%", "#920783"],
    ];
    const svgNamespace = "http://www.w3.org/2000/svg";

    function syncViewportSize() {
      const viewport = window.visualViewport;
      const width = viewport ? viewport.width : window.innerWidth;
      const height = viewport ? viewport.height : window.innerHeight;

      document.documentElement.style.setProperty("--viewport-width", width + "px");
      document.documentElement.style.setProperty("--viewport-height", height + "px");
    }

    function createSvgElement(name) {
      return document.createElementNS(svgNamespace, name);
    }

    function ensureRainbowGradient(svg, index) {
      let defs = svg.querySelector(":scope > defs[data-dekamoji-rainbow]");
      let gradient = defs?.querySelector("linearGradient");

      if (gradient) {
        return gradient;
      }

      defs = createSvgElement("defs");
      defs.dataset.dekamojiRainbow = "true";
      gradient = createSvgElement("linearGradient");
      gradient.id = "dekamoji-rainbow-svg-" + index;
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");

      for (const [offset, color] of rainbowStops) {
        const stop = createSvgElement("stop");

        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", color);
        gradient.append(stop);
      }

      defs.append(gradient);
      svg.prepend(defs);

      return gradient;
    }

    function syncRainbowLines(mainRect) {
      const lines = target.querySelectorAll(".katex .frac-line, .katex .overline-line, .katex .underline-line");

      for (const line of lines) {
        const rect = line.getBoundingClientRect();

        line.style.setProperty("--dekamoji-rainbow-width", mainRect.width + "px");
        line.style.setProperty("--dekamoji-rainbow-x", mainRect.left - rect.left + "px");
      }
    }

    function syncRainbowSvgs(mainRect) {
      const svgs = target.querySelectorAll(".katex svg");

      svgs.forEach((svg, index) => {
        const rect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;

        if (rect.width === 0 || viewBox.width === 0) {
          return;
        }

        const gradient = ensureRainbowGradient(svg, index);
        const pixelPerSvgUnit = Math.max(rect.width / viewBox.width, rect.height / viewBox.height);
        const svgUnitPerPixel = 1 / pixelPerSvgUnit;
        const x1 = viewBox.x + (mainRect.left - rect.left) * svgUnitPerPixel;
        const x2 = viewBox.x + (mainRect.right - rect.left) * svgUnitPerPixel;

        gradient.setAttribute("x1", x1);
        gradient.setAttribute("x2", x2);
        gradient.setAttribute("y1", "0");
        gradient.setAttribute("y2", "0");

        for (const path of svg.querySelectorAll("path")) {
          path.setAttribute("fill", "url(#" + gradient.id + ")");
        }
      });
    }

    function syncKatexRainbow() {
      if (target.dataset.rainbow !== "true") {
        return;
      }

      const mainRect = target.getBoundingClientRect();

      syncRainbowLines(mainRect);
      syncRainbowSvgs(mainRect);
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
      syncKatexRainbow();
    }

    window.addEventListener("resize", fitText);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", fitText);
    }
    if (document.fonts) {
      document.fonts.ready.then(fitText);
    }
    fitText();
  </script>
</body>
</html>`;
}

function streamFile(response, fileUrl, contentType) {
  const stream = createReadStream(fileUrl);

  stream.on("error", () => {
    if (!response.headersSent) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    }

    response.end("Not Found");
  });

  stream.on("open", () => {
    response.writeHead(200, { "content-type": contentType });
    stream.pipe(response);
  });
}

function getFontContentType(pathname) {
  const extension = pathname.endsWith(".woff2")
    ? ".woff2"
    : pathname.slice(pathname.lastIndexOf("."));

  return KATEX_FONT_CONTENT_TYPES[extension] ?? "application/octet-stream";
}

function serveKatexAsset(url, response) {
  if (url.pathname === "/katex/katex.min.css") {
    streamFile(response, KATEX_CSS_URL, "text/css; charset=utf-8");
    return true;
  }

  if (KATEX_FONT_PATTERN.test(url.pathname)) {
    const fontName = url.pathname.slice("/katex/fonts/".length);
    const fontUrl = new URL(`../node_modules/katex/dist/fonts/${fontName}`, import.meta.url);

    streamFile(response, fontUrl, getFontContentType(url.pathname));
    return true;
  }

  if (url.pathname.startsWith("/katex/")) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return true;
  }

  return false;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (serveKatexAsset(url, response)) {
    return;
  }

  const text = getDisplayText(url);
  const textColor = getDisplayColor(url);

  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(renderPage(text, { textColor }));
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
