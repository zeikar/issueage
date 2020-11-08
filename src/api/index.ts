import Api from "./request";

export const getAllIssues = async () => {
  try {
    const response = await Api.getAllIssues();
    return response;
  } catch (error) {
    console.error(error);
  }
};
