import { Octokit } from "@octokit/rest";
import Config from "../../config.json";

const octokit = new Octokit();

const getAllIssues = (): Promise<any> => {
  // https://octokit.github.io/rest.js/v18#issues-list-for-repo
  return octokit.issues.listForRepo({
    owner: Config.repoOwner,
    repo: Config.repoName,
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

const API = {
  getAllIssues,
  getIssue,
};
export default API;
