import { appConfig } from "../config/appConfig";
import { apiRequest } from "./apiClient";

const STORAGE_KEY = "hackiathon.auditResults";

function readResults() {
  const storedResults = localStorage.getItem(STORAGE_KEY);

  if (!storedResults) {
    return [];
  }

  try {
    return JSON.parse(storedResults);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function writeResults(results) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  return results;
}

function createMockAuditResult(payload) {
  const hasImages = payload.documents.some(
    (document) => document.type === "FOTOS_DANIO" || document.mimeType?.startsWith("image/")
  );
  const status = payload.documents.length >= 4 && hasImages ? "OBSERVADO" : "REVISION_HUMANA";

  return {
    auditId: `AUD-${Date.now()}`,
    caseId: payload.caseId,
    status,
    confidence: 0.91,
    summary: "Se detectaron diferencias entre la factura y el tarifario.",
    discrepancies: [
      {
        type: "PRECIO_MAXIMO",
        severity: "ALTA",
        message: "La mano de obra facturada supera el tarifario de referencia."
      }
    ],
    recommendation: "Solicitar correccion de factura o soporte adicional.",
    payload,
    createdAt: new Date().toISOString()
  };
}

export async function runAudit(payload) {
  if (appConfig.useMocks) {
    const result = createMockAuditResult(payload);
    writeResults([result, ...readResults()]);
    return result;
  }

  try {
    const result = await apiRequest("/audits/run", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    writeResults([result, ...readResults()]);
    return result;
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    const result = createMockAuditResult(payload);
    writeResults([{ ...result, source: "fallback", apiError: error.message }, ...readResults()]);
    return result;
  }
}

export async function getAuditResult(caseId) {
  const localResult = readResults().find((result) => result.caseId === caseId);

  if (localResult || appConfig.useMocks) {
    return localResult ?? null;
  }

  try {
    return apiRequest(`/audit-results/${caseId}`);
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    return localResult ?? null;
  }
}

export async function getAuditHistory() {
  return readResults();
}
