import { updateQueryString } from "./querystring";

export const generatePaginationLink = (
  queryString: string,
  page: number
): string => {
  return "/articles" + updateQueryString(queryString, { page });
};
