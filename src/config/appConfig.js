const defaultApiBaseUrl = "https://demo-hackaithon-backend.onrender.com/api";

function normalizeApiBaseUrl(url) {
  return (url || defaultApiBaseUrl).replace(/\/+$/, "");
}

function getRuntimeApiBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.__APP_CONFIG__?.VITE_API_BASE_URL;
}

export const appConfig = {
  apiBaseUrl: normalizeApiBaseUrl(getRuntimeApiBaseUrl() || import.meta.env.VITE_API_BASE_URL)
};
