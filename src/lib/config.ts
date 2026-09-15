import rawConfig from "../../config.json";

export type SiteConfig = {
  websiteTitle: string;
  repoOwner: string;
  repoName: string;
  source: "issues" | "discussions";
  discussionCategory?: string;
  googleAnalyticsId: string;
  // BCP 47 tag for <html lang>, dates, the giscus interface and the web font's Hangul faces (ko); one with a region (ko-KR) also sets og:locale
  language: string;
};

// a language subtag followed by optional script, region or variant subtags
const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

// dates are formatted in the site's language, and Intl throws on a tag it can't parse, such as one with two regions
const isLocale = (tag: string): boolean => {
  try {
    Intl.getCanonicalLocales(tag);
    return true;
  } catch {
    return false;
  }
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
  if (
    typeof language !== "string" ||
    !LANGUAGE_TAG.test(language) ||
    !isLocale(language)
  ) {
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

// a repository made from the template starts with the template's own config.json, which would publish the template's
// posts and send comments to its repository, so a build in GitHub Actions (which sets GITHUB_REPOSITORY) must name its own
export const assertBuildingConfiguredRepository = (
  repoOwner: string,
  repoName: string,
  runningRepository: string | undefined,
): void => {
  if (
    runningRepository &&
    runningRepository.toLowerCase() !== `${repoOwner}/${repoName}`.toLowerCase()
  ) {
    throw new Error(
      `config.json: "repoOwner"/"repoName" name ${repoOwner}/${repoName}, but this build runs in ${runningRepository}; set them to this repository`,
    );
  }
};

// the Hangul faces are about 85KB gzipped of render-blocking @font-face rules, so only a site written in Korean loads them
export const fontStylesheetFor = (language: string): string =>
  language.split("-")[0].toLowerCase() === "ko"
    ? "/src/styles/fonts-hangul.css"
    : "/src/styles/fonts-latin.css";

// without a custom domain of its own, GitHub Pages serves a repository from the domain root only when its name matches
// <repoOwner>.github.io; every other repository is served under /<repoName>
export const basePathFor = (repoOwner: string, repoName: string): string => {
  return repoName.toLowerCase() === `${repoOwner}.github.io`.toLowerCase()
    ? "/"
    : `/${repoName}`;
};

// where the site is served: the origin for absolute URLs and the base path every link starts with.
// The deploy workflow passes the base URL actions/configure-pages reports, which follows custom domains (a project
// repository with a domain of its own is served from that domain's root); local builds have none and assume the
// default <owner>.github.io address
export const siteLocationFor = (
  reportedUrl: string | undefined,
  repoOwner: string,
  repoName: string,
): { site: string; base: string } => {
  if (reportedUrl === undefined || reportedUrl.trim() === "") {
    return {
      site: `https://${repoOwner.toLowerCase()}.github.io`,
      base: basePathFor(repoOwner, repoName),
    };
  }
  let url: URL | undefined;
  try {
    url = new URL(reportedUrl.trim());
  } catch {
    // reported below
  }
  // "localhost:4321" parses too, as a URL with the scheme "localhost:" and the origin "null"
  if (url === undefined || !["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      `SITE_URL must be an http(s) URL such as https://example.com/blog, got ${JSON.stringify(reportedUrl)}`,
    );
  }
  return { site: url.origin, base: url.pathname.replace(/\/+$/, "") || "/" };
};
