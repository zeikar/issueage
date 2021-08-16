import Config from "../../config.json";

export const generateIssueSearchQuery = (labels: string[]): string => {
  const q = [];
  q.push("is:issue");
  q.push("is:open");
  if (labels.length > 0) {
    q.push(`label:${labels.join(",")}`);
  }
  q.push(`repo:${Config.repoOwner}/${Config.repoName}`);

  return q.join("+");
};
