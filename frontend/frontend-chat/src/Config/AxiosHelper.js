import axios from "axios";

const API_URL = "https://wecord-s3vw.onrender.com";

export const httpClient = axios.create({
  baseURL: API_URL,
});