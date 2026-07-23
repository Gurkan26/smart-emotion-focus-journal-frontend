export const DEFAULT_PRODUCTION_BACKEND_URL = "https://smart-emotion-focus-journal-backend.onrender.com";

/**
 * Dynamically resolves the backend API URL.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_API_URL (if set)
 * 2. Browser check for local environments (localhost / 127.0.0.1) -> http://localhost:8080
 * 3. Default Production Backend (Render)
 */
export const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8080";
    }
  }

  return DEFAULT_PRODUCTION_BACKEND_URL;
};

/**
 * Helper to get default JSON and Authorization headers.
 */
export const getAuthHeaders = (token, extraHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("journal_auth_token") : null);
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
};
