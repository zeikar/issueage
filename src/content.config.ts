import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { siteConfig } from "./lib/config";
import {
  fetchDiscussionCategory,
  fetchDiscussions,
  fetchIssues,
  fetchProfile,
  fetchRepositoryDescription,
} from "./lib/github";
import { renderMarkdown } from "./lib/markdown";
import { isTrustedPost, toPost } from "./lib/posts";
import { tagSlug } from "./lib/tags";
import type { TocItem } from "./lib/toc";

const { repoOwner, repoName, source } = siteConfig;

// both collections need the category in discussions mode, and Astro starts their loaders together, so they share one
// request; it is dropped once settled, so a dev server's later content sync sees a renamed or deleted category
let categoryRequest: ReturnType<typeof fetchDiscussionCategory> | undefined;
const discussionCategory = () =>
  (categoryRequest ??= fetchDiscussionCategory(
    repoOwner,
    repoName,
    // parseSiteConfig requires a category in discussions mode
    siteConfig.discussionCategory!,
  ).finally(() => {
    categoryRequest = undefined;
  }));

const fetchPostNodes = async () => {
  if (source === "issues") {
    return fetchIssues(repoOwner, repoName);
  }
  const { category } = await discussionCategory();
  return fetchDiscussions(repoOwner, repoName, category.id);
};

const tocItem: z.ZodType<TocItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    text: z.string(),
    depth: z.number(),
    children: z.array(tocItem),
  }),
);

const posts = defineCollection({
  loader: {
    name: "github-posts",
    load: async ({ store, logger, parseData }) => {
      const trusted = (await fetchPostNodes())
        .filter((node) => isTrustedPost(node, siteConfig))
        .map(toPost);

      store.clear();
      for (const post of trusted) {
        const { html, toc, excerpt, thumbnail } = await renderMarkdown(
          post.body,
        ).catch((error: unknown) => {
          throw new Error(`rendering ${post.url} failed`, { cause: error });
        });
        const id = String(post.number);
        const data = await parseData({
          id,
          data: {
            number: post.number,
            title: post.title,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            url: post.url,
            commentCount: post.commentCount,
            tags: post.tags.map((tag) => ({ ...tag, slug: tagSlug(tag.name) })),
            excerpt,
            thumbnail,
            toc,
          },
        });
        store.set({ id, data, rendered: { html } });
      }

      logger.info(
        `Loaded ${trusted.length} posts from ${repoOwner}/${repoName} ${source}`,
      );
    },
  },
  schema: z.object({
    number: z.number(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    url: z.string(),
    commentCount: z.number(),
    tags: z.array(
      z.object({
        name: z.string(),
        // label colors are interpolated into style attributes, so only a hex value may pass
        color: z.string().regex(/^[0-9a-f]{6}$/i),
        slug: z.string(),
      }),
    ),
    excerpt: z.string(),
    thumbnail: z.string().nullable(),
    toc: z.array(tocItem),
  }),
});

const site = defineCollection({
  loader: async () => {
    const [profile, description, discussion] = await Promise.all([
      fetchProfile(repoOwner),
      fetchRepositoryDescription(repoOwner, repoName),
      source === "discussions" ? discussionCategory() : null,
    ]);
    return [
      {
        id: "site",
        profile,
        description,
        // giscus needs the repository and category ids, and only discussions mode uses giscus
        repoId: discussion?.repoId ?? null,
        discussionCategory: discussion?.category ?? null,
      },
    ];
  },
  schema: z.object({
    profile: z.object({
      login: z.string(),
      name: z.string().nullable(),
      bio: z.string().nullable(),
      avatarUrl: z.string(),
      url: z.string(),
      followers: z.object({ totalCount: z.number() }),
      following: z.object({ totalCount: z.number() }),
    }),
    description: z.string().nullable(),
    repoId: z.string().nullable(),
    discussionCategory: z
      .object({ id: z.string(), name: z.string(), slug: z.string() })
      .nullable(),
  }),
});

export const collections = { posts, site };
