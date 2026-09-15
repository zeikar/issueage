import { describe, expect, it } from "vitest";
import {
  assertBuildingConfiguredRepository,
  basePathFor,
  parseSiteConfig,
  siteLocationFor,
} from "../src/lib/config";

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

describe("assertBuildingConfiguredRepository", () => {
  it("rejects a build running in another repository, such as a fresh copy of the template", () => {
    expect(() =>
      assertBuildingConfiguredRepository("zeikar", "repozine", "alice/blog"),
    ).toThrow(/zeikar\/repozine.*alice\/blog/);
  });

  it("accepts the configured repository in any letter case", () => {
    expect(() =>
      assertBuildingConfiguredRepository(
        "Zeikar",
        "Repozine",
        "zeikar/repozine",
      ),
    ).not.toThrow();
  });

  it.each([undefined, ""])(
    "skips the check outside GitHub Actions (%j)",
    (running) => {
      expect(() =>
        assertBuildingConfiguredRepository("zeikar", "repozine", running),
      ).not.toThrow();
    },
  );
});

describe("siteLocationFor", () => {
  it.each([
    ["https://zeikar.dev/repozine", "https://zeikar.dev", "/repozine"],
    ["https://zeikar.dev/repozine/", "https://zeikar.dev", "/repozine"],
    ["https://zeikar.github.io", "https://zeikar.github.io", "/"],
    // a project repository with its own custom domain is served from that domain's root, not under /<repoName>
    ["https://blog.example.com", "https://blog.example.com", "/"],
  ])(
    "splits the Pages URL %s into the site %s and the base %s",
    (reported, site, base) => {
      expect(siteLocationFor(reported, "zeikar", "repozine")).toEqual({
        site,
        base,
      });
    },
  );

  it.each([undefined, "", "  "])(
    "falls back to the default github.io address when none is reported (%j)",
    (reported) => {
      expect(siteLocationFor(reported, "Zeikar", "repozine")).toEqual({
        site: "https://zeikar.github.io",
        base: "/repozine",
      });
      expect(siteLocationFor(reported, "zeikar", "zeikar.github.io")).toEqual({
        site: "https://zeikar.github.io",
        base: "/",
      });
    },
  );

  it.each(["zeikar.dev/repozine", "localhost:4321", "ftp://zeikar.dev"])(
    "rejects %j, which is not an http(s) URL",
    (reported) => {
      expect(() => siteLocationFor(reported, "zeikar", "repozine")).toThrow(
        /SITE_URL/,
      );
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
