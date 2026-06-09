const HEX_COLOR_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function getDisplayColor(url) {
  const color = url.searchParams.get("color");
  const match = color?.match(HEX_COLOR_PATTERN);

  if (!match) {
    return null;
  }

  return `#${match[1].toLowerCase()}`;
}
