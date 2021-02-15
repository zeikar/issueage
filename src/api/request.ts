import { Octokit } from "@octokit/rest";
import Config from "../../config.json";

const octokit = new Octokit();

const getAllIssues = (labels): Promise<any> => {
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

const getAllLabels = (): Promise<any> => {
  return octokit.issues.listLabelsForRepo({
    owner: Config.repoOwner,
    repo: Config.repoName,
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
