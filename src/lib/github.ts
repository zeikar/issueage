// this module only runs in Node at build time, and the project has no @types/node
declare const process: { env: Record<string, string | undefined> };

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// a GitHub 5xx or a dropped connection is usually momentary, and a failed build on an issue or discussion event leaves
// the site stale until the next event, so such a request is tried once more; a 4xx (a bad token, a rate limit) would fail again
const RETRY_DELAY_MS = 5000;

type Reply = { status: number; text: string };

// one attempt reads the whole body: fetch resolves once the headers arrive, and the connection can still drop after that
const post = async (token: string, body: string): Promise<Reply> => {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // without it repository and category ids come back in the deprecated legacy format
      "X-Github-Next-Global-ID": "1",
    },
    body,
  });
  return { status: response.status, text: await response.text() };
};

const postWithRetry = async (token: string, body: string): Promise<Reply> => {
  let failure: string;
  try {
    const reply = await post(token, body);
    if (reply.status < 500) {
      return reply;
    }
    failure = `status ${reply.status}`;
  } catch (error) {
    failure = String(error);
  }
  console.warn(
    `GitHub GraphQL request failed with ${failure}; retrying in ${RETRY_DELAY_MS / 1000}s`,
  );
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return post(token, body);
};

export const githubGraphql = async <T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not set: posts are fetched from the GitHub GraphQL API at build time, e.g. GITHUB_TOKEN=$(gh auth token) npm run build",
    );
  }

  const { status, text } = await postWithRetry(
    token,
    JSON.stringify({ query, variables }),
  );
  if (status !== 200) {
    throw new Error(`GitHub GraphQL request failed with ${status}: ${text}`);
  }

  const { data, errors } = JSON.parse(text) as {
    data: T;
    errors?: { type?: string; message: string }[];
  };
  // GraphQL reports a missing repository or user, and an exhausted primary rate limit (type RATE_LIMITED), with status 200;
  // secondary rate limits arrive as 403 or 429 instead
  if (errors && errors.length > 0) {
    const messages = errors.map(({ type, message }) =>
      type ? `${type}: ${message}` : message,
    );
    throw new Error(`GitHub GraphQL errors: ${messages.join("; ")}`);
  }
  return data;
};

export type Label = { name: string; color: string };

// Issue and Discussion share these fields, but their open state differs: Issue has state, Discussion has closed and category
const POST_FIELDS = `
  __typename number title body createdAt lastEditedAt url
  author { login }
  repository { nameWithOwner }
  labels(first: 100) { nodes { name color } }
  comments { totalCount }
`;

// untrusted until isTrustedPost passes: repository listings include posts by anyone
export type PostNode = {
  __typename: string;
  number: number;
  title: string;
  body: string | null;
  createdAt: string;
  // null until the body is edited
  lastEditedAt: string | null;
  url: string;
  // null when the author's account was deleted
  author: { login: string } | null;
  repository: { nameWithOwner: string };
  labels: { nodes: Label[] };
  comments: { totalCount: number };
  state?: string;
  closed?: boolean;
  category?: { slug: string };
};

type PostPage = {
  repository: {
    nameWithOwner: string;
    posts: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: PostNode[];
    };
  };
};

// both queries alias their connection as "posts" so one pager serves issues and discussions
const fetchAllPosts = async (
  owner: string,
  repo: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<PostNode[]> => {
  const nodes: PostNode[] = [];
  let cursor: string | null = null;
  do {
    const page: PostPage = await githubGraphql<PostPage>(query, {
      owner,
      repo,
      ...variables,
      cursor,
    });
    const { nameWithOwner } = page.repository;
    // GitHub follows a renamed or transferred repository, whose posts then all fail isTrustedPost and the build would go green with no posts
    if (nameWithOwner.toLowerCase() !== `${owner}/${repo}`.toLowerCase()) {
      throw new Error(
        `config.json: ${owner}/${repo} now resolves to ${nameWithOwner}; update "repoOwner"/"repoName"`,
      );
    }
    const { pageInfo } = page.repository.posts;
    nodes.push(...page.repository.posts.nodes);
    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (cursor !== null);
  return nodes;
};

export const fetchIssues = (owner: string, repo: string): Promise<PostNode[]> =>
  fetchAllPosts(
    owner,
    repo,
    `query ($owner: String!, $repo: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        nameWithOwner
        posts: issues(states: OPEN, filterBy: { createdBy: $owner }, first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { ${POST_FIELDS} state }
        }
      }
    }`,
  );

type DiscussionCategory = { id: string; name: string; slug: string };

export const fetchDiscussionCategory = async (
  owner: string,
  repo: string,
  slug: string,
): Promise<{ repoId: string; category: DiscussionCategory }> => {
  const { repository } = await githubGraphql<{
    repository: {
      id: string;
      discussionCategories: { nodes: DiscussionCategory[] };
    };
  }>(
    `query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        discussionCategories(first: 100) { nodes { id name slug } }
      }
    }`,
    { owner, repo },
  );

  const categories = repository.discussionCategories.nodes;
  const category = categories.find((candidate) => candidate.slug === slug);
  if (category === undefined) {
    const available = categories.map((candidate) => candidate.slug).join(", ");
    throw new Error(
      `config.json: "discussionCategory" "${slug}" is not a discussion category slug in ${owner}/${repo}; available slugs: ${available || "none"}`,
    );
  }
  return { repoId: repository.id, category };
};

export const fetchDiscussions = (
  owner: string,
  repo: string,
  categoryId: string,
): Promise<PostNode[]> =>
  fetchAllPosts(
    owner,
    repo,
    `query ($owner: String!, $repo: String!, $categoryId: ID!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        nameWithOwner
        posts: discussions(categoryId: $categoryId, states: OPEN, first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { ${POST_FIELDS} closed category { slug } }
        }
      }
    }`,
    { categoryId },
  );

// the repository's About text, which describes the site when there is one
export const fetchRepositoryDescription = async (
  owner: string,
  repo: string,
): Promise<string | null> => {
  const { repository } = await githubGraphql<{
    repository: { description: string | null };
  }>(
    `query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) { description }
    }`,
    { owner, repo },
  );
  return repository.description?.trim() || null;
};

type Profile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  url: string;
  followers: { totalCount: number };
  following: { totalCount: number };
};

export const fetchProfile = async (login: string): Promise<Profile> => {
  const { user } = await githubGraphql<{ user: Profile }>(
    `query ($login: String!) {
      user(login: $login) {
        login name bio avatarUrl url
        followers { totalCount }
        following { totalCount }
      }
    }`,
    { login },
  );
  return user;
};
