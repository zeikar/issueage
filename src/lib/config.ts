import rawConfig from "../../config.json";

export type SiteConfig = {
  websiteTitle: string;
  repoOwner: string;
  repoName: string;
  source: "issues" | "discussions";
  discussionCategory?: string;
  googleAnalyticsId: string;
  // BCP 47 tag for <html lang>; one with a region (ko-KR) also sets og:locale
  language: string;
};

// a language subtag followed by optional script, region or variant subtags
const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

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
  const {
    source,
    discussionCategory,
    googleAnalyticsId = "",
    language = "en",
  } = config;

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
  if (typeof language !== "string" || !LANGUAGE_TAG.test(language)) {
    throw new Error(
      `config.json: "language" must be a language tag such as "en" or "ko-KR", got ${JSON.stringify(language)}`,
    );
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
    language,
  };
};

export const siteConfig: SiteConfig = parseSiteConfig(rawConfig);

// the deploy workflow passes the origin actions/configure-pages reports, which follows a custom domain;
// local builds have none, and the owner's github.io origin is the best guess for their absolute URLs
export const siteOriginFor = (
  reportedOrigin: string | undefined,
  repoOwner: string,
): string => {
  if (reportedOrigin === undefined || reportedOrigin.trim() === "") {
    return `https://${repoOwner.toLowerCase()}.github.io`;
  }
  let url: URL | undefined;
  try {
    url = new URL(reportedOrigin.trim());
  } catch {
    // reported below
  }
  // "localhost:4321" parses too, as a URL with the scheme "localhost:" and the origin "null"
  if (url === undefined || !["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      `SITE_ORIGIN must be an http(s) origin such as https://example.com, got ${JSON.stringify(reportedOrigin)}`,
    );
  }
  return url.origin;
};

// GitHub Pages serves a repository from the domain root only when its name matches <repoOwner>.github.io; every other repository is served under /<repoName>
export const basePathFor = (repoOwner: string, repoName: string): string => {
  return repoName.toLowerCase() === `${repoOwner}.github.io`.toLowerCase()
    ? "/"
    : `/${repoName}`;
};
