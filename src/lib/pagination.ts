export const PAGE_SIZE = 10;

export type PaginationItem = number | "…";

// the first page, the current page ±2 and the last page, with "…" where pages are skipped
export const getPaginationPages = (
  current: number,
  last: number,
): PaginationItem[] => {
  const nearby = [-2, -1, 0, 1, 2].map((offset) => current + offset);
  const pages = [...new Set([1, ...nearby, last])].filter(
    (page) => page >= 1 && page <= last,
  );

  const items: PaginationItem[] = [];
  pages.forEach((page, i) => {
    if (i > 0 && page - pages[i - 1] > 1) {
      items.push("…");
    }
    items.push(page);
  });
  return items;
};
