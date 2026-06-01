export const DEFAULT_TEXT = "URLの後ろに文字を入れてください";

export function getDisplayText(url) {
  const rawPath = url.pathname.replace(/^\/+/, "");

  if (rawPath === "") {
    return DEFAULT_TEXT;
  }

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}
