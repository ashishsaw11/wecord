import axios from "axios";

const API_URL = "http://localhost:8080";

export const httpClient = axios.create({
  baseURL: API_URL,
});