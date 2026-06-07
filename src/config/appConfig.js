const defaultApiBaseUrl = "https://demo-hackaithon-backend.onrender.com/api";

function normalizeApiBaseUrl(url) {
  return (url || defaultApiBaseUrl).replace(/\/+$/, "");
}

export const appConfig = {
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
};
