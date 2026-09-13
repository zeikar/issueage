import type { Post } from "./posts";

export type TagSummary = {
  name: string;
  color: string;
  slug: string;
  count: number;
};

// the slug is a URL path segment: whitespace and characters that end or escape a segment become "-", while unicode, "+" and "&" stay readable
export const tagSlug = (name: string): string => {
  const slug = name.toLowerCase().replace(/[\s/?#%\\]/g, "-");
  // URL resolution removes "." and ".." path segments, so /tags/./ and /tags/../ could never reach a tag page
  return slug === "." || slug === ".." ? slug.replaceAll(".", "-") : slug;
};

export const collectTags = (posts: Pick<Post, "tags">[]): TagSummary[] => {
  const bySlug = new Map<string, TagSummary>();

  for (const { tags } of posts) {
    for (const { name, color } of tags) {
      const slug = tagSlug(name);
      const tag = bySlug.get(slug);
      if (tag === undefined) {
        bySlug.set(slug, { name, color, slug, count: 1 });
      } else if (tag.name === name) {
        tag.count++;
      } else {
        // both labels would claim the same /tags/<slug>/ page
        throw new Error(
          `labels "${tag.name}" and "${name}" share the tag slug "${slug}"; rename one of them`,
        );
      }
    }
  }

  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
};
