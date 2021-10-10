import Api from "./request";
import Consts from "./consts";

export const getAllArticles = async (
  tags: string[],
  search: string,
  page: number
): Promise<any> => {
  try {
    const response = await Api.getAllIssues(
      tags,
      search,
      page,
      Consts.articlesPerPage
    );
    // inject some variables
    response.data.per_page = Consts.articlesPerPage;
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

export const getTags = async (page?: number): Promise<any> => {
  try {
    const response = await Api.getAllLabels(page, Consts.tagsPerPage);
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
