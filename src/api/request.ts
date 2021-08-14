import { Octokit } from "@octokit/rest";
import Config from "../../config.json";

const octokit = new Octokit();

const getAllIssues = (labels: string): Promise<any> => {
  // https://octokit.github.io/rest.js/v18#issues-list-for-repo
  return octokit.issues.listForRepo({
    owner: Config.repoOwner,
    repo: Config.repoName,
    labels,
  });
};

const getIssue = (issueNumber: number): Promise<any> => {
  // https://octokit.github.io/rest.js/v18#issues-list-for-repo
  return octokit.issues.get({
    owner: Config.repoOwner,
    repo: Config.repoName,
    issue_number: issueNumber,
  });
};

const getAllLabels = (page?: number, per_page?: number): Promise<any> => {
  return octokit.issues.listLabelsForRepo({
    owner: Config.repoOwner,
    repo: Config.repoName,
    page,
    per_page,
  });
};

const getGithubProfile = (): Promise<any> => {
  return octokit.users.getByUsername({
    username: Config.repoOwner,
  });
};

const API = {
  getAllIssues,
  getIssue,
  getAllLabels,
  getGithubProfile,
};
export default API;
