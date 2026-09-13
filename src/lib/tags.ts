import type { Post } from "./posts";

export type TagSummary = {
  name: string;
  color: string;
  slug: string;
  count: number;
};

// lowercase, and turn characters that would end or escape a URL path segment into "-"; unicode, "+" and "&" stay readable
const baseSlug = (name: string): string => {
  const slug = name.toLowerCase().replace(/[\s/?#%\\]/g, "-");
  // URL resolution removes "." and ".." path segments, so /tags/./ and /tags/../ could never reach a tag page
  return slug === "." || slug === ".." ? slug.replaceAll(".", "-") : slug;
};

// an 8-hex-digit FNV-1a digest of the exact name, used to tell apart names whose base slug lost information
const hash8 = (name: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

// true when turning name into its base slug lost information (a character was replaced, or it's a dot segment),
// or when the base slug already ends in what looks like a hashed suffix; either way a bare base slug isn't safe to reuse
const needsHash = (base: string, name: string): boolean =>
  base !== name.toLowerCase() || /-[0-9a-f]{8}$/.test(base);

// derives a tag's slug from its name alone, so the slug never depends on which other labels exist: readable names
// (e.g. "medium", "C++", "리뷰") keep their base slug, and names that would lose information going through baseSlug -
// or that already look hashed - get a stable "-<hash8>" suffix computed from the name itself. Two different names can
// only ever produce the same slug through a genuine 32-bit hash collision, which collectTags below guards against.
export const tagSlug = (name: string): string => {
  const base = baseSlug(name);
  return needsHash(base, name) ? `${base}-${hash8(name)}` : base;
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
        // both labels would claim the same /tags/<slug>/ page; only a genuine 32-bit hash collision can cause this
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
