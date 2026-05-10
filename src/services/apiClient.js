import { appConfig } from "../config/appConfig";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = await safeReadError(response);
    throw new Error(errorBody || `API respondio con estado ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function safeReadError(response) {
  try {
    const data = await response.json();
    return data.detail || data.message || JSON.stringify(data);
  } catch {
    return response.statusText;
  }
}
