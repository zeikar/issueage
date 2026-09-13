import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "../lib/toc";

interface Props {
  items: TocItem[];
}

const flattenIds = (items: TocItem[]): string[] =>
  items.flatMap((item) => [item.id, ...flattenIds(item.children)]);

const TocList = ({
  items,
  activeId,
  depth,
}: {
  items: TocItem[];
  activeId: string | null;
  depth: number;
}) => (
  <ul className={depth > 0 ? "mt-1 space-y-1 pl-4" : "space-y-1"}>
    {items.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "true" : undefined}
          className={
            activeId === item.id
              ? "font-medium text-gray-900 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }
        >
          {item.text}
        </a>
        {item.children.length > 0 && (
          <TocList
            items={item.children}
            activeId={activeId}
            depth={depth + 1}
          />
        )}
      </li>
    ))}
  </ul>
);

export default function Toc({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ids = useMemo(() => flattenIds(items), [items]);

  useEffect(() => {
    // ids can contain raw HTML authored in a post, so look them up by id rather than building a selector
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null);
    if (headings.length === 0) {
      return;
    }

    const lastId = headings[headings.length - 1].id;
    const visibleIds = new Set<string>();

    const pickActive = () => {
      // a short last section may never reach the band below, so activate it directly once the page can't scroll further;
      // but on a page that doesn't scroll at all, this would always fire and the observer should decide instead
      const scrollable =
        document.documentElement.scrollHeight > window.innerHeight + 1;
      if (
        scrollable &&
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 1
      ) {
        setActiveId(lastId);
        return;
      }
      // headings is in document order; with short sections a later heading can already be in the band, so the first match is the current section
      const current = headings.find((heading) => visibleIds.has(heading.id));
      if (current) {
        setActiveId(current.id);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }
        pickActive();
      },
      { rootMargin: "0px 0px -70% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("scroll", pickActive, { passive: true });
    window.addEventListener("resize", pickActive);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pickActive);
      window.removeEventListener("resize", pickActive);
    };
  }, [ids]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <TocList items={items} activeId={activeId} depth={0} />
    </nav>
  );
}
