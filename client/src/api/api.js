import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://pos-backend-ldxg.onrender.com";

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not defined. Falling back to default backend URL:", API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
