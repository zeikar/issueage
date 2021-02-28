import Api from "./request";

export const getAllIssues = async (labels: string[]): Promise<any> => {
  try {
    const response = await Api.getAllIssues(labels.join(","));
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getIssue = async (issueNumber: number): Promise<any> => {
  try {
    const response = await Api.getIssue(issueNumber);
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getAllLabels = async (): Promise<any> => {
  try {
    const response = await Api.getAllLabels();
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getGithubProfile = async (): Promise<any> => {
  try {
    const response = await Api.getGithubProfile();
    return response;
  } catch (error) {
    console.error(error);
  }
};
