export const PAGE_SIZE = 10;

export type PaginationItem = number | "…";

// the first page, the current page ±1 and the last page, plus the middle page of each stretch skipped between them,
// so a long run of pages can be halved in one click; "…" marks skipped pages, except a lone one, which is shown instead
export const getPaginationPages = (
  current: number,
  last: number,
): PaginationItem[] => {
  const anchors = [
    ...new Set([1, current - 1, current, current + 1, last]),
  ].filter((page) => page >= 1 && page <= last);
  const pages = anchors.flatMap((page, i) => {
    const next = anchors[i + 1];
    return next !== undefined && next - page > 1
      ? [page, Math.floor((page + next) / 2)]
      : [page];
  });

  const items: PaginationItem[] = [];
  pages.forEach((page, i) => {
    const skipped = i > 0 ? page - pages[i - 1] - 1 : 0;
    if (skipped === 1) {
      items.push(page - 1);
    } else if (skipped > 1) {
      items.push("…");
    }
    items.push(page);
  });
  return items;
};
