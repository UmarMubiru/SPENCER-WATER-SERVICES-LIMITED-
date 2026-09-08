import axios from "axios";

const inventoryAPI = axios.create({
  baseURL: "http://127.0.0.1:8000/api/inventory",
});

inventoryAPI.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("token")
      : null;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default inventoryAPI;
