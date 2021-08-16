import { updateQueryString } from "./querystring";

export const convertLabelsToTags = (labels: any[]): string[] => {
  return labels.map((e) => e.name);
};

export const getTagLink = (qs: string, tag: string): string => {
  return "/articles" + updateQueryString(qs, { tag, page: 1 });
};
