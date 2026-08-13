import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Intercept all requests and attach Clerk JWT token for @clerk/express authentication
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (typeof window !== "undefined" && window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error retrieving Clerk token for API request:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
