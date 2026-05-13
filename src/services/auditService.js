import { apiEndpoints } from "../config/database";
import { apiRequest } from "./apiClient";

export async function runAudit(caseId, payload = {}) {
  return apiRequest(apiEndpoints.auditRun(caseId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getLatestAudit(caseId) {
  return apiRequest(apiEndpoints.auditLatest(caseId));
}

export async function getAuditHistory(caseId) {
  if (!caseId) {
    return [];
  }

  const data = await apiRequest(apiEndpoints.auditHistory(caseId));
  return Array.isArray(data) ? data : data?.audits ?? data?.history ?? [];
}

export async function getAllAuditHistory() {
  const data = await apiRequest(apiEndpoints.auditHistoryAll);
  return Array.isArray(data) ? data : data?.audits ?? data?.history ?? [];
}

export async function generateFinalVerdict(caseId) {
  return apiRequest(apiEndpoints.auditFinalVerdict(caseId), {
    method: "POST",
    body: JSON.stringify({ caseId, source: "frontend-final-verdict" })
  });
}

export async function runBatchAudit(caseIds) {
  return apiRequest(apiEndpoints.auditBatch, {
    method: "POST",
    body: JSON.stringify({ caseIds })
  });
}
