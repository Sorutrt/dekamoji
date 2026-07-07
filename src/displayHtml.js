import katex from "katex";

const MATH_DELIMITERS = [
  { open: "$$", close: "$$", displayMode: true },
  { open: "\\[", close: "\\]", displayMode: true },
  { open: "/[", close: "/]", displayMode: true },
  { open: "\\(", close: "\\)", displayMode: false },
  { open: "/(", close: "/)", displayMode: false },
  { open: "$", close: "$", displayMode: false },
];

export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function findNextDelimiter(text, startIndex) {
  let next = null;

  for (let index = startIndex; index < text.length; index += 1) {
    const delimiter = MATH_DELIMITERS.find((candidate) => text.startsWith(candidate.open, index));

    if (delimiter) {
      next = { delimiter, index };
      break;
    }
  }

  return next;
}

function renderMath(math, displayMode) {
  return katex.renderToString(normalizeMathBackslashes(math), {
    displayMode,
    throwOnError: false,
  });
}

function normalizeMathBackslashes(math) {
  return math.replaceAll(/\/([A-Za-z]+)/g, "\\$1");
}

export function renderDisplayHtml(text) {
  let html = "";
  let index = 0;

  while (index < text.length) {
    const match = findNextDelimiter(text, index);

    if (!match) {
      html += escapeHtml(text.slice(index));
      break;
    }

    const { delimiter } = match;
    const mathStart = match.index + delimiter.open.length;
    const mathEnd = text.indexOf(delimiter.close, mathStart);

    if (mathEnd === -1) {
      html += escapeHtml(text.slice(index));
      break;
    }

    html += escapeHtml(text.slice(index, match.index));
    html += renderMath(text.slice(mathStart, mathEnd), delimiter.displayMode);
    index = mathEnd + delimiter.close.length;
  }

  return html;
}
