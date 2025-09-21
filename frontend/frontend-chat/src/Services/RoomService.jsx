import { httpClient } from "../Config/AxiosHelper";

export const createRoomApi = async (roomDetail) => {
  const respone = await httpClient.post(`/api/v1/rooms`, roomDetail, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return respone.data;
};

export const joinChatApi = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
  return response.data;
};

export const getMessages = async (roomId, size = 50, page = 0) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`
  );
  return response.data;
};

export const registerUserApi = async (user) => {
  const response = await httpClient.post("/api/v1/users/register", user);
  return response.data;
};

export const loginUserApi = async (credentials) => {
  const response = await httpClient.post("/api/v1/users/login", credentials);
  return response.data;
};