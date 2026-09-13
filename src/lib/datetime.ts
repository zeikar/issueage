// input: dateString (2021-02-18T14:50:29Z)
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // pages are rendered at build time, so the build machine's time zone must not shift the date
    timeZone: "UTC",
  });
};
