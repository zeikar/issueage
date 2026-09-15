// the locales giscus.app serves (its i18n.js); the widget loads https://giscus.app/<locale>/widget, which is a 404 for any other
// prettier-ignore
const GISCUS_LOCALES = [
  "ar", "be", "bg", "ca", "cs", "da", "de", "en", "eo", "es", "eu", "fa", "fr", "gr", "gsw", "hbs", "he", "hu", "id", "it",
  "ja", "kh", "ko", "nl", "pl", "pt", "ro", "ru", "th", "tr", "vi", "uk", "uz", "zh-CN", "zh-Hans", "zh-Hant", "zh-TW", "zh-HK",
];

// giscus's own codes for languages it names differently from BCP 47
const GISCUS_ALIASES: Record<string, string> = {
  el: "gr",
  km: "kh",
  sr: "hbs",
  hr: "hbs",
  bs: "hbs",
};

// the longest leading part of the site's language that giscus has a locale for (ko for ko-KR, zh-TW for zh-TW), else English
export const giscusLangFor = (language: string): string => {
  const subtags = language.toLowerCase().split("-");
  for (let length = subtags.length; length > 0; length--) {
    const prefix = subtags.slice(0, length).join("-");
    const locale = GISCUS_LOCALES.find(
      (candidate) => candidate.toLowerCase() === prefix,
    );
    if (locale !== undefined) {
      return locale;
    }
  }
  const [primary] = subtags;
  if (primary === "zh") {
    // Chinese that names neither a script nor a region giscus has (zh, zh-SG, zh-MO): Intl knows which script it's written in
    return new Intl.Locale(language).maximize().script === "Hant"
      ? "zh-Hant"
      : "zh-CN";
  }
  return GISCUS_ALIASES[primary] ?? "en";
};
