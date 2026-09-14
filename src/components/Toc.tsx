import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import type { TocItem } from "../lib/toc";

interface Props {
  items: TocItem[];
}

const flattenIds = (items: TocItem[]): string[] =>
  items.flatMap((item) => [item.id, ...flattenIds(item.children)]);

// glide only for clicks here: scroll-behavior on <html> would also animate opening a shared link to a heading, and
// back/forward. Keyboard activation (detail 0) keeps the native jump, which also moves where Tab continues to the
// heading; clicks with a modifier key keep their browser meaning, such as opening a new tab
const scrollToHeading = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
  const heading = document.getElementById(id);
  if (
    !heading ||
    event.detail === 0 ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  // like a plain fragment link, clicking the entry already in the address bar adds no second history entry;
  // location.hash is percent-encoded (Korean ids), so compare it with the id encoded the same way
  const hash = new URL(`#${id}`, window.location.href).hash;
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
};

const TocList = ({
  items,
  activeId,
  depth,
}: {
  items: TocItem[];
  activeId: string | null;
  depth: number;
}) => (
  <ul className={depth > 0 ? "pl-3.5" : undefined}>
    {items.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={(event) => scrollToHeading(event, item.id)}
          aria-current={activeId === item.id ? "true" : undefined}
          className={
            "block border-l-2 py-1 pl-3 leading-snug break-keep break-words " +
            (activeId === item.id
              ? "border-fg font-semibold text-fg"
              : "border-rule text-muted hover:text-fg")
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
      // after a jump back to the top (the Home key) no heading may cross the band, which would leave the old entry
      // highlighted; at the top the first section is the closest one
      if (window.scrollY <= 0) {
        setActiveId(headings[0].id);
        return;
      }
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

  const navRef = useRef<HTMLElement>(null);

  // a list taller than the sidebar scrolls on its own, so keep the current section in view as reading moves on;
  // setting scrollTop moves only the list, where scrollIntoView could scroll the page as well
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!nav || !link) {
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.top < navBox.top) {
      nav.scrollTop -= navBox.top - linkBox.top;
    } else if (linkBox.bottom > navBox.bottom) {
      nav.scrollTop += linkBox.bottom - navBox.bottom;
    }
  }, [activeId]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      aria-label="Table of contents"
      className="min-h-0 overflow-y-auto"
    >
      <TocList items={items} activeId={activeId} depth={0} />
    </nav>
  );
}
