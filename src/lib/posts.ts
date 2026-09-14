import type { SiteConfig } from "./config";
import type { Label, PostNode } from "./github";

export type Post = {
  number: number;
  title: string;
  body: string;
  createdAt: string;
  url: string;
  author: string;
  tags: Label[];
  commentCount: number;
  // when the post's body was last edited (GitHub doesn't count title or label changes), for sitemaps and article metadata
  updatedAt: string;
};

export type TrustedPostNode = PostNode & { author: { login: string } };

type TrustConfig = Pick<
  SiteConfig,
  "repoOwner" | "repoName" | "source" | "discussionCategory"
>;

const equalsIgnoringCase = (a: string, b: string): boolean =>
  a.toLowerCase() === b.toLowerCase();

// anyone can open an issue or a discussion on a public repo, so only the owner's open posts in this repo are trusted
export const isTrustedPost = (
  node: PostNode,
  config: TrustConfig,
): node is TrustedPostNode => {
  if (
    node.author === null ||
    !equalsIgnoringCase(node.author.login, config.repoOwner) ||
    !equalsIgnoringCase(
      node.repository.nameWithOwner,
      `${config.repoOwner}/${config.repoName}`,
    )
  ) {
    return false;
  }
  if (config.source === "issues") {
    return node.__typename === "Issue" && node.state === "OPEN";
  }
  return (
    node.__typename === "Discussion" &&
    node.closed === false &&
    node.category !== undefined &&
    node.category.slug === config.discussionCategory
  );
};

export const toPost = (node: TrustedPostNode): Post => ({
  number: node.number,
  title: node.title,
  body: node.body ?? "",
  createdAt: node.createdAt,
  url: node.url,
  author: node.author.login,
  tags: node.labels.nodes,
  commentCount: node.comments.totalCount,
  updatedAt: node.lastEditedAt ?? node.createdAt,
});

export const byNewest = (
  a: Pick<Post, "createdAt">,
  b: Pick<Post, "createdAt">,
): number => Date.parse(b.createdAt) - Date.parse(a.createdAt);
