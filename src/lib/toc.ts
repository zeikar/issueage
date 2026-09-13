export type Heading = {
  id: string;
  text: string;
  depth: number;
};

export type TocItem = Heading & {
  children: TocItem[];
};

// a heading nests under the closest earlier heading of smaller depth, so skipped levels (h1 then h3) nest one step
export const nestHeadings = (headings: Heading[]): TocItem[] => {
  const root: TocItem[] = [];
  const open: TocItem[] = [];

  for (const heading of headings) {
    const item: TocItem = { ...heading, children: [] };
    while (open.length > 0 && open[open.length - 1].depth >= item.depth) {
      open.pop();
    }
    (open.length > 0 ? open[open.length - 1].children : root).push(item);
    open.push(item);
  }

  return root;
};
