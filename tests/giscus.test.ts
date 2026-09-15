import { describe, expect, it } from "vitest";
import { giscusLangFor } from "../src/lib/giscus";

describe("giscusLangFor", () => {
  it.each([
    ["ko-KR", "ko"],
    ["KO", "ko"],
    ["pt-BR", "pt"],
    ["zh-tw", "zh-TW"],
    ["zh-Hant-HK", "zh-Hant"],
    // giscus's own codes for these languages differ from BCP 47's
    ["el", "gr"],
    ["km-KH", "kh"],
    ["sr-Latn", "hbs"],
    ["zh", "zh-CN"],
    ["zh-SG", "zh-CN"],
    // Macau writes Traditional Chinese
    ["zh-MO", "zh-Hant"],
  ])("maps %j to the giscus locale %j", (language, lang) => {
    expect(giscusLangFor(language)).toBe(lang);
  });

  // giscus.app answers any other locale path with a 404, which would leave the comments empty
  it.each(["sw-KE", "ig"])(
    "falls back to English for %j, which giscus has no locale for",
    (language) => {
      expect(giscusLangFor(language)).toBe("en");
    },
  );
});
