import axios from "axios";

const inventoryAPI = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/inventory`,
});

inventoryAPI.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  console.log("Interceptor running");
  console.log("Token:", token);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default inventoryAPI;