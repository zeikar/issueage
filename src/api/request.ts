import axios from "axios";
import { GET_ALL_ISSUES } from "./queries";

const axiosAPI = axios.create({
  baseURL: "https://api.github.com/graphql",
});

const graphQLRequest = (query: string) => {
  const headers = {
    Authorization: "bearer c2506ee733b85d9c52e9c04164602ba1dee2094f",
  };

  return axiosAPI({
    method: "POST",
    data: { query },
    headers,
  })
    .then((res) => {
      return Promise.resolve(res.data.data);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

const getAllIssues = () => graphQLRequest(GET_ALL_ISSUES);

const API = {
  getAllIssues,
};
export default API;
