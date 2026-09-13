import Api from "./request";
import Consts from "./consts";
import Config from "../../config.json";

export const getAllArticles = async (
  tags: string[],
  search: string,
  page: number
): Promise<any> => {
  const response = await Api.getAllIssues(
    tags,
    search,
    page,
    Consts.articlesPerPage
  );
  // inject some variables
  response.data.per_page = Consts.articlesPerPage;
  // our qualifiers are not enough: ones typed into the search box, like "author:someone" or "repo:other/repo", are OR'ed with them
  response.data.items = response.data.items.filter(isArticle);
  response.data.items.forEach(fillEmptyBody);
  return response;
};

// resolves to null when the issue does not exist or is not an article
export const getIssue = async (issueNumber: number): Promise<any> => {
  let response;
  try {
    response = await Api.getIssue(issueNumber);
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
  if (!isArticle(response.data)) {
    return null;
  }
  fillEmptyBody(response.data);
  return response;
};

export const getTags = async (page?: number): Promise<any> => {
  return Api.getAllLabels(page, Consts.tagsPerPage);
};

export const getGithubProfile = async (): Promise<any> => {
  return Api.getGithubProfile();
};

const repositoryPath =
  `/repos/${Config.repoOwner}/${Config.repoName}`.toLowerCase();

// anyone can open an issue on a public repo, so only the owner's issues in this repo are trusted as articles
function isArticle(issue): boolean {
  return (
    !issue.pull_request &&
    issue.user?.login.toLowerCase() === Config.repoOwner.toLowerCase() &&
    (issue.repository_url ?? "").toLowerCase().endsWith(repositoryPath)
  );
}

// GitHub returns body: null for issues without a description
function fillEmptyBody(issue): void {
  issue.body = issue.body ?? "";
}
