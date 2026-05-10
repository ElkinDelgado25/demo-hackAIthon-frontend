const STORAGE_KEY = "hackiathon.uploads";

export const uploadEndpoints = {
  create: "POST /uploads",
  list: "GET /uploads",
  remove: "DELETE /uploads/{id}"
};

export const allowedUploadExtensions = ["pdf", "csv", "xlsx", "json", "png", "jpg", "jpeg"];
export const requiredDocumentTypes = ["FACTURA", "ORDEN_REPARACION", "DETALLE_MANO_OBRA", "FOTOS_DANIO"];
export const maxUploadSizeBytes = 20 * 1024 * 1024;

function readUploads() {
  const storedUploads = localStorage.getItem(STORAGE_KEY);

  if (!storedUploads) {
    return [];
  }

  try {
    return JSON.parse(storedUploads);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function writeUploads(uploads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
  return uploads;
}

export function validateAuditFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedUploadExtensions.includes(extension)) {
    return `Tipo no permitido. Usa PDF, CSV, XLSX, JSON, PNG o JPG.`;
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

export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function getUploads() {
  return readUploads();
}

export async function createUpload({ file, auditNumber, documentType, replaceId }) {
  const validationError = validateAuditFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const uploads = readUploads();
  const fileExtension = file.name.split(".").pop()?.toUpperCase() ?? "ARCHIVO";
  const nextUpload = {
    id: replaceId ?? `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    auditNumber,
    documentType,
    name: file.name,
    size: file.size,
    type: fileExtension,
    mimeType: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    status: "cargado",
    extractionStatus: "pendiente",
    extractedData: null
  };

  const nextUploads = replaceId
    ? uploads.map((upload) => (upload.id === replaceId ? nextUpload : upload))
    : [nextUpload, ...uploads];

  writeUploads(nextUploads);
  return nextUpload;
}

export async function createUploads({ files, auditNumber, documentType }) {
  const uploads = [];

  for (const item of files) {
    const file = item.file ?? item;
    const upload = await createUpload({ file, auditNumber, documentType: item.documentType ?? documentType });
    uploads.push(upload);
  }

  return uploads;
}

export async function deleteUpload(id) {
  const uploads = readUploads();
  writeUploads(uploads.filter((upload) => upload.id !== id));
  return { id };
}
