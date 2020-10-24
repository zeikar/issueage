// pokemon.js
// Implementations for all the calls for the pokemon endpoints.
import Api from "./request";

// Method to get a list of all Pokemon
export const getAllIssues = async () => {
  try {
    const response = await Api.getAllIssues();
    return response;
  } catch (error) {
    console.error(error);
  }
};
