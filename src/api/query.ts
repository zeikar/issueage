import Config from "../../config.json";

export const generateIssueSearchQuery = (
  labels: string[],
  search: string
): string => {
  const q = [];
  if (search && search.length > 0) {
    q.push(search);
  }
  q.push("is:issue");
  q.push("is:open");
  if (labels.length > 0) {
    q.push(`label:${labels.map((label) => `"${label}"`).join(",")}`);
  }
  q.push(`repo:${Config.repoOwner}/${Config.repoName}`);

  return q.join("+");
};
