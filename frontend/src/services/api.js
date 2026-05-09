import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// Passwords
export const getPasswords = () => API.get("/passwords");
export const addPassword = (data) => API.post("/passwords", data);
export const updatePassword = (id, data) => API.put(`/passwords/${id}`, data);
export const deletePassword = (id) => API.delete(`/passwords/${id}`);

// Layer 2
export const checkBreach = (password) => API.post("/passwords/breach/check", { password });
export const createShareLink = (id) => API.post(`/passwords/${id}/share`);
export const accessShareLink = (token) => API.get(`/passwords/share/${token}`);
export const getActivityLogs = () => API.get("/passwords/activity/logs");

// Unique features
export const exportVault = () => API.get("/passwords/export/vault");