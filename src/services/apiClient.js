import { appConfig } from "../config/appConfig";

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = buildHeaders(options.headers, isFormData);
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await safeReadError(response);
    if (response.status >= 500) {
      throw new Error(errorBody || "Could not run the audit. Check backend logs.");
    }
    throw new Error(errorBody || `Could not load data. HTTP status ${response.status}.`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

function buildHeaders(customHeaders = {}, isFormData = false) {
  const token = getAuthToken();
  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...customHeaders
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("accessToken") ?? window.localStorage.getItem("authToken") ?? "";
}

async function safeReadError(response) {
  try {
    const data = await response.json();
    return data.detail || data.message || JSON.stringify(data);
  } catch {
    return response.statusText || "Could not load data. Check backend connectivity.";
  }
}
