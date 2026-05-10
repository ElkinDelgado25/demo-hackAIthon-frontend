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
