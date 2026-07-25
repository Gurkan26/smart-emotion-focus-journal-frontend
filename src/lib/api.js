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

/**
 * Get the current user's ID from localStorage.
 * Returns null if no user is logged in.
 */
export const getUserId = () => {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("journal_auth_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.id || null;
    }
  } catch (e) {
    console.error("Failed to parse stored user for ID:", e);
  }
  return null;
};

/**
 * Generate a user-specific localStorage key to prevent cross-user data leakage.
 * Example: getUserStorageKey("journal_telemetry_logs") => "journal_telemetry_logs_42"
 */
export const getUserStorageKey = (baseKey) => {
  const userId = getUserId();
  if (userId) {
    return `${baseKey}_${userId}`;
  }
  return baseKey;
};

/**
 * Clear all user-specific cached data from localStorage.
 * Called during logout and account deletion.
 */
export const clearAllUserStorage = (userId) => {
  if (typeof window === "undefined") return;
  const uid = userId || getUserId();
  if (uid) {
    localStorage.removeItem(`journal_telemetry_logs_${uid}`);
  }
  // Also clean up any legacy non-user-scoped keys
  localStorage.removeItem("journal_telemetry_logs");
};
