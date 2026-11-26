const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL must be set to the API base URL.");
}

export const API_BASE_URL = apiBaseUrl;
export const API_ORIGIN = apiBaseUrl
  .replace(/\/api\/v\d+\/?$/, "")
  .replace(/\/$/, "");
