import { getEntry, type CollectionEntry } from "astro:content";

export const getSite = async (): Promise<CollectionEntry<"site">["data"]> => {
  const site = await getEntry("site", "site");
  if (site === undefined) {
    throw new Error('the "site" collection has no "site" entry');
  }
  return site.data;
};
