import { appConfig } from "../config/appConfig";
import { displayText } from "../utils/displayText";

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = buildHeaders(options.headers, isFormData);
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = displayText(await safeReadError(response));
    if (response.status >= 500) {
      throw new Error(errorBody || "No se pudo ejecutar la auditoria. Revisa los logs del backend.");
    }
    throw new Error(errorBody || `No se pudieron cargar los datos. Estado HTTP ${response.status}.`);
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
    return response.statusText || "No se pudieron cargar los datos. Revisa la conexion con el backend.";
  }
}
