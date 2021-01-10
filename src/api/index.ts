import Api from "./request";

export const getAllIssues = async () => {
  try {
    const response = await Api.getAllIssues();
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getIssue = async (issueNumber: number) => {
  try {
    const response = await Api.getIssue(issueNumber);
    return response;
  } catch (error) {
    console.error(error);
  }
};
