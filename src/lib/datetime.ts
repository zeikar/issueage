// shared with the inline script in Base.astro, which re-renders dates in the reader's time zone
export const DATE_LOCALE = "en-US";
export const DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;

// input: dateString (2021-02-18T14:50:29Z)
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(DATE_LOCALE, {
    ...DATE_OPTIONS,
    // pages are rendered at build time, so the build machine's time zone must not shift the date;
    // this UTC date is what readers without JavaScript see
    timeZone: "UTC",
  });
};
