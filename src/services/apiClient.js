import { appConfig } from "../config/appConfig";

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers: isFormData
      ? options.headers
      : {
          "Content-Type": "application/json",
          ...options.headers
        }
  });

  if (!response.ok) {
    const errorBody = await safeReadError(response);
    throw new Error(errorBody || `No se pudo consultar la informacion. Estado HTTP ${response.status}.`);
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

async function safeReadError(response) {
  try {
    const data = await response.json();
    return data.detail || data.message || JSON.stringify(data);
  } catch {
    return response.statusText || "No se pudo consultar la informacion. Verifique la conexion con el backend.";
  }
}
