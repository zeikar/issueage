import { updateQueryString } from "./querystring";

export const generatePaginationLink = (
  queryString: string,
  page: number
): string => {
  return "/" + updateQueryString(queryString, { page });
};

export const getTagLink = (qs: string, tag: string): string => {
  return "/" + updateQueryString(qs, { tag, page: 1 });
};

export const getSearchLink = (qs: string, search: string): string => {
  return "/" + updateQueryString(qs, { search, page: 1 });
};
