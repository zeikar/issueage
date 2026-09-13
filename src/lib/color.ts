// input: 6-digit hex label color without "#" (e.g. f29513)
export const tagTextClass = (hex: string): "text-black" | "text-white" => {
  // https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // above ~0.179 black text has a higher contrast ratio than white text
  return luminance > 0.179 ? "text-black" : "text-white";
};
