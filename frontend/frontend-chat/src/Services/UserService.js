import { httpClient } from "../Config/AxiosHelper";

const API_URL = "/api/v1/users";

export const searchUsers = async (query) => {
  try {
    const response = await httpClient.get(`${API_URL}/search`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export const registerUserApi = async (user) => {
  const response = await httpClient.post(`${API_URL}/register`, user);
  return response.data;
};

export const loginUserApi = async (credentials) => {
  const response = await httpClient.post(`${API_URL}/login`, credentials);
  return response.data;
};