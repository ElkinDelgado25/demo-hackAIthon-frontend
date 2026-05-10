import { apiEndpoints } from "../config/database";
import { apiRequest } from "./apiClient";

export const allowedUploadExtensions = ["pdf", "csv", "xlsx", "json", "png", "jpg", "jpeg"];
export const requiredDocumentTypes = ["FACTURA", "ORDEN_REPARACION", "DETALLE_MANO_OBRA", "FOTOS_DANIO"];
export const maxUploadSizeBytes = 20 * 1024 * 1024;

export function validateAuditFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedUploadExtensions.includes(extension)) {
    return "Tipo no permitido. Usa PDF, CSV, XLSX, JSON, PNG o JPG.";
  }

  if (file.size > maxUploadSizeBytes) {
    return `El archivo supera el maximo total permitido de ${formatFileSize(maxUploadSizeBytes)}.`;
  }

  return "";
}

export function validateAuditFilesTotal(files, currentTotalBytes = 0) {
  const filesTotal = files.reduce((total, file) => total + file.size, 0);
  const nextTotal = currentTotalBytes + filesTotal;

  if (nextTotal > maxUploadSizeBytes) {
    return `El total seleccionado supera ${formatFileSize(maxUploadSizeBytes)}. Total actual: ${formatFileSize(nextTotal)}.`;
  }

  return "";
}

export function formatFileSize(bytes = 0) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function getDocuments(caseId) {
  if (!caseId) {
    return [];
  }

  const data = await apiRequest(apiEndpoints.caseDocuments(caseId));
  return Array.isArray(data) ? data : data?.documents ?? data?.items ?? [];
}

export async function uploadDocuments(caseId, files) {
  const formData = new FormData();
  const metadata = files.map((item) => ({
    name: item.file.name,
    type: item.documentType,
    size: item.file.size,
    mimeType: item.file.type || "application/octet-stream"
  }));

  files.forEach((item) => {
    formData.append("files", item.file);
  });
  formData.append("documents", JSON.stringify(metadata));

  return apiRequest(apiEndpoints.caseDocuments(caseId), {
    method: "POST",
    body: formData
  });
}
