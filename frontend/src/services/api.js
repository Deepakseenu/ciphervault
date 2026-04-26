import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token to every request automatically
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