import { updateQueryString } from "./querystring";

export const getPaginationLink = (qs: string, page: number): string => {
  return "/" + updateQueryString(qs, { page });
};

export const getTagLink = (qs: string, tag: string): string => {
  return "/" + updateQueryString(qs, { tag, page: 1 });
};

export const getSearchLink = (qs: string, search: string): string => {
  return "/" + updateQueryString(qs, { search, page: 1 });
};

export const deleteTagFromLink = (qs: string): string => {
  return "/" + updateQueryString(qs, { tag: "" });
};

export const deleteSearchFromLink = (qs: string): string => {
  return "/" + updateQueryString(qs, { search: "" });
};
