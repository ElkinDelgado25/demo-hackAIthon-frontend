import { apiEndpoints } from "../config/database";
import { apiRequest } from "./apiClient";

export const allowedUploadExtensions = ["pdf", "csv", "xlsx", "json", "png", "jpg", "jpeg", "txt"];
export const requiredDocumentTypes = ["FACTURA", "ORDEN_REPARACION", "DETALLE_MANO_OBRA", "FOTOS_DANIO"];
export const documentTypeOptions = [
  { value: "FACTURA", label: "Factura" },
  { value: "ORDEN_REPARACION", label: "Orden de reparacion" },
  { value: "DETALLE_MANO_OBRA", label: "Detalle mano de obra" },
  { value: "FOTOS_DANIO", label: "Fotos del dano" },
  { value: "TARIFARIO", label: "Tarifario" },
  { value: "POLIZA", label: "Poliza" },
  { value: "SUSTENTO_ADICIONAL", label: "Sustento adicional" }
];
export const maxUploadSizeBytes = 20 * 1024 * 1024;

export function validateAuditFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedUploadExtensions.includes(extension)) {
    return "Tipo no permitido. Usa PDF, CSV, XLSX, JSON, PNG, JPG, JPEG o TXT.";
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
  return normalizeDocumentsResponse(data);
}

export async function getAllDocuments() {
  const data = await apiRequest(apiEndpoints.allDocuments);
  return normalizeDocumentsResponse(data);
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

export function normalizeDocumentsResponse(response) {
  const documents = Array.isArray(response) ? response : response?.documents ?? response?.items ?? [];
  return documents.map(normalizeDocument);
}

export function normalizeDocument(document) {
  return {
    id: document.id ?? document.documentId ?? document.name,
    auditNumber: document.auditNumber ?? document.caseId ?? document.case_id ?? "",
    documentType: document.documentType ?? document.document_type ?? document.type ?? "",
    name: document.originalName ?? document.name ?? document.filename ?? document.fileName ?? "Dato no disponible",
    size: Number(document.size ?? 0),
    type: document.extension ?? document.fileType ?? document.mimeType ?? document.mime_type ?? "",
    mimeType: document.mimeType ?? document.mime_type ?? "",
    uploadedAt: document.uploadedAt ?? document.createdAt ?? document.created_at ?? "",
    status: document.status ?? "cargado",
    extractionStatus: document.parseStatus ?? document.extractionStatus ?? document.extraction_status ?? "Dato no disponible",
    parseStatus: document.parseStatus ?? document.extractionStatus ?? document.extraction_status ?? "",
    parseError: document.parseError ?? document.parse_error ?? ""
  };
}
