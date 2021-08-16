export const convertLabelsToTags = (labels: any[]): string[] => {
  return labels.map((e) => e.name);
};
