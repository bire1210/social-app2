import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json", 
  },
});

// Request interceptor — attach token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Don't clear tokens or redirect for auth-check calls (getMe)
        const requestUrl = error.config?.url || "";
        const isAuthCheck = requestUrl.includes("/auth/me");

        // Public pages where 401 is expected — don't redirect
        const publicPaths = ["/login", "/register", "/explore"];
        const isOnPublicPage = publicPaths.some((p) =>
          window.location.pathname.includes(p)
        );
        const isOnHomePage = window.location.pathname === "/";

        if (!isAuthCheck) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        // Only redirect to login if user is on a protected page
        if (!isOnPublicPage && !isOnHomePage && !isAuthCheck) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
