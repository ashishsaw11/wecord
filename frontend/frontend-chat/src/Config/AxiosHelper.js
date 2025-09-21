import axios from "axios";
export const baseURL = "https://wecor.onrender.com";
export const httpClient = axios.create({
  baseURL: baseURL,
});