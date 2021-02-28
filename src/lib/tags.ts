export const convertLabelsToTags = (labels: any[]): string[] => {
  return labels.map((e) => e.name);
};

export const getTagLink = (tag: string): string => {
  return "/tags/" + encodeURIComponent(tag);
};
