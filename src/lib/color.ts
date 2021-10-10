/*
 * get bulma text class from background color
 * input: 6-digit rgb color (e.g. 123456)
 * output: bulma text color class https://bulma.io/documentation/helpers/color-helpers/#text-color
 */
export const getTextClassFromBackgroundColor = (
  backgroundColor: string
): string => {
  const rgb = chopString(backgroundColor, 2);

  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = Math.round(
    (parseInt(rgb[0], 16) * 299 +
      parseInt(rgb[1], 16) * 587 +
      parseInt(rgb[2], 16) * 114) /
      1000
  );
  const textColor = brightness > 125 ? "has-text-black" : "has-text-white";
  return textColor;
};

/*
 * change color to dimmed color (add alpha)
 * input: 6-digit rgb color (e.g. 123456)
 * output: 8-digit rgba color (e.g. 12345678)
 */
export const getDimmedColor = (color: string): string => {
  return color + 99;
};

function chopString(str: string, size: number): string[] {
  if (str === null) {
    return [];
  }
  str = String(str);
  size = ~~size;
  return size > 0 ? str.match(new RegExp(".{1," + size + "}", "g")) : [str];
}
