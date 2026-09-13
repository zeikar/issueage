import rawConfig from "../../config.json";

export type SiteConfig = {
  websiteTitle: string;
  repoOwner: string;
  repoName: string;
  source: "issues" | "discussions";
  discussionCategory?: string;
  googleAnalyticsId: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const nonEmptyString = (
  config: Record<string, unknown>,
  key: string,
): string => {
  const value = config[key];
  if (!isNonEmptyString(value)) {
    throw new Error(`config.json: "${key}" must be a non-empty string`);
  }
  return value;
};

// config.json is edited by hand in each fork, so fail the build with the key to fix
export const parseSiteConfig = (
  config: Record<string, unknown>,
): SiteConfig => {
  const websiteTitle = nonEmptyString(config, "websiteTitle");
  const repoOwner = nonEmptyString(config, "repoOwner");
  const repoName = nonEmptyString(config, "repoName");
  // an empty or missing googleAnalyticsId turns analytics off
  const { source, discussionCategory, googleAnalyticsId = "" } = config;

  if (source !== "issues" && source !== "discussions") {
    throw new Error(
      `config.json: "source" must be "issues" or "discussions", got ${JSON.stringify(source)}`,
    );
  }
  if (source === "discussions" && !isNonEmptyString(discussionCategory)) {
    throw new Error(
      `config.json: "discussionCategory" is required when "source" is "discussions"`,
    );
  }
  if (typeof googleAnalyticsId !== "string") {
    throw new Error(`config.json: "googleAnalyticsId" must be a string`);
  }

  return {
    websiteTitle,
    repoOwner,
    repoName,
    source,
    discussionCategory: isNonEmptyString(discussionCategory)
      ? discussionCategory
      : undefined,
    googleAnalyticsId,
  };
};

export const siteConfig: SiteConfig = parseSiteConfig(rawConfig);

// GitHub Pages serves a repository from the domain root only when its name matches <repoOwner>.github.io; every other repository is served under /<repoName>
export const basePathFor = (repoOwner: string, repoName: string): string => {
  return repoName.toLowerCase() === `${repoOwner}.github.io`.toLowerCase()
    ? "/"
    : `/${repoName}`;
};
