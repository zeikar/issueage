import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

const getAllIssues = () => {
  // https://octokit.github.io/rest.js/v18#issues-list-for-repo
  return octokit.issues.listForRepo({
    // TODO: get these variables from config.js
    owner: "zeikar",
    repo: "issueage",
  });
};

const getIssue = (issueNumber: number) => {
  // https://octokit.github.io/rest.js/v18#issues-list-for-repo
  return octokit.issues.get({
    // TODO: get these variables from config.js
    owner: "zeikar",
    repo: "issueage",
    issue_number: issueNumber,
  });
};

const API = {
  getAllIssues,
  getIssue,
};
export default API;
