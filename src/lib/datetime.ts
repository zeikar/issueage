// shared with the inline script in Base.astro, which re-renders dates in the reader's time zone
export const DATE_LOCALE = "en-US";
export const DATE_FORMATS = {
  long: { year: "numeric", month: "long", day: "numeric" },
  short: { year: "numeric", month: "short", day: "numeric" },
} as const;

export type DateFormat = keyof typeof DATE_FORMATS;

// input: dateString (2021-02-18T14:50:29Z)
export const formatDate = (dateString: string, format: DateFormat): string => {
  return new Date(dateString).toLocaleDateString(DATE_LOCALE, {
    ...DATE_FORMATS[format],
    // pages are rendered at build time, so the build machine's time zone must not shift the date;
    // this UTC date is what readers without JavaScript see
    timeZone: "UTC",
  });
};
