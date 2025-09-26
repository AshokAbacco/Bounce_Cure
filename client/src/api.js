// // frontend/src/api.js
// import axios from "axios";
// export const api = axios.create({ baseURL: "http://localhost:5000/api" });

import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

