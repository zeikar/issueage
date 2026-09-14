import { describe, expect, it } from "vitest";
import { basePathFor, parseSiteConfig, siteOriginFor } from "../src/lib/config";

const issuesConfig = {
  websiteTitle: "Repozine",
  repoOwner: "zeikar",
  repoName: "repozine",
  source: "issues",
  googleAnalyticsId: "",
};

const without = (key: string): Record<string, unknown> => {
  const config: Record<string, unknown> = { ...issuesConfig };
  delete config[key];
  return config;
};

describe("parseSiteConfig", () => {
  it.each([
    ["a missing websiteTitle", without("websiteTitle"), /"websiteTitle"/],
    ["a blank repoOwner", { ...issuesConfig, repoOwner: "" }, /"repoOwner"/],
    ["a missing repoName", without("repoName"), /"repoName"/],
    ["a miscased source", { ...issuesConfig, source: "Issues" }, /"source"/],
    ["a blank language", { ...issuesConfig, language: "" }, /"language"/],
    [
      "a language that is not a tag",
      { ...issuesConfig, language: "Korean" },
      /"language"/,
    ],
    [
      "discussions without a category",
      { ...issuesConfig, source: "discussions" },
      /"discussionCategory"/,
    ],
  ])("rejects %s", (_name, config, message) => {
    expect(() => parseSiteConfig(config)).toThrow(message);
  });

  it("accepts a discussions config with a category", () => {
    const config = {
      ...issuesConfig,
      source: "discussions",
      discussionCategory: "Blog",
    };
    expect(parseSiteConfig(config)).toEqual({ ...config, language: "en" });
  });

  it("keeps a language tag with a region", () => {
    expect(
      parseSiteConfig({ ...issuesConfig, language: "ko-KR" }).language,
    ).toBe("ko-KR");
  });

  it("turns Google Analytics off when the key is missing", () => {
    expect(
      parseSiteConfig(without("googleAnalyticsId")).googleAnalyticsId,
    ).toBe("");
  });
});

describe("siteOriginFor", () => {
  it("uses the origin the Pages deployment reports, custom domain included", () => {
    expect(siteOriginFor("https://zeikar.dev", "zeikar")).toBe(
      "https://zeikar.dev",
    );
    expect(siteOriginFor("https://zeikar.dev/", "zeikar")).toBe(
      "https://zeikar.dev",
    );
  });

  it.each([undefined, "", "  "])(
    "falls back to the owner's github.io origin when none is reported (%j)",
    (origin) => {
      expect(siteOriginFor(origin, "Zeikar")).toBe("https://zeikar.github.io");
    },
  );

  it.each(["zeikar.dev", "localhost:4321", "ftp://zeikar.dev"])(
    "rejects %j, which is not an http(s) origin",
    (origin) => {
      expect(() => siteOriginFor(origin, "zeikar")).toThrow(/SITE_ORIGIN/);
    },
  );
});

describe("basePathFor", () => {
  it("serves a project site under the repository name", () => {
    expect(basePathFor("zeikar", "repozine")).toBe("/repozine");
  });

  it.each(["zeikar.github.io", "Zeikar.GitHub.IO"])(
    "serves the owner's user site %j from the root",
    (repoName) => {
      expect(basePathFor("zeikar", repoName)).toBe("/");
    },
  );

  it("only treats a .github.io suffix as a user site", () => {
    expect(basePathFor("zeikar", "github.io-notes")).toBe("/github.io-notes");
  });

  it("serves another repository ending in .github.io under its own name", () => {
    expect(basePathFor("zeikar", "notes.github.io")).toBe("/notes.github.io");
  });
});
