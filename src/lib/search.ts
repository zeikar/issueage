export interface ExcerptPart {
  text: string;
  marked: boolean;
}

// Pagefind's excerpt escapes only < and > and wraps each match in <mark>, one word at a time so marks never nest;
// splitting on the marks alternates plain and matched text, which renders as text without an HTML sink
export const excerptParts = (excerpt: string): ExcerptPart[] =>
  excerpt
    .split(/<\/?mark>/)
    .map((part, index) => ({
      text: part.replaceAll("&lt;", "<").replaceAll("&gt;", ">"),
      marked: index % 2 === 1,
    }))
    .filter((part) => part.text !== "");
