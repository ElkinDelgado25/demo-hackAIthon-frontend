import { apiEndpoints, databaseConfig } from "../config/database";
import { auditCases } from "../data/auditCases";

function normalizeCase(apiCase) {
  return {
    id: String(apiCase.id ?? apiCase.codigo ?? apiCase.claimNumber),
    claimNumber: apiCase.claimNumber ?? apiCase.codigo,
    workshop: apiCase.workshop ?? apiCase.taller_nombre ?? apiCase.taller ?? "Taller asignado",
    vehicle: apiCase.vehicle ?? apiCase.vehiculo,
    plate: apiCase.plate ?? apiCase.placa,
    reportedDamage: apiCase.reportedDamage ?? apiCase.danos_reportados,
    invoiceTotal: Number(apiCase.invoiceTotal ?? apiCase.monto_estimado ?? 0),
    tariffTotal: Number(apiCase.tariffTotal ?? apiCase.monto_estimado ?? 0),
    status: normalizeCaseStatus(apiCase.status ?? apiCase.estado),
    rawStatus: apiCase.estado ?? apiCase.status,
    confidence: Number(apiCase.confidence ?? 0),
    receivedAt: apiCase.receivedAt ?? apiCase.created_at,
    findings: apiCase.findings ?? []
  };
}

function normalizeCaseStatus(status) {
  const statusMap = {
    NUEVO: "medio",
    PENDIENTE_DOCUMENTOS: "medio",
    LISTO_PARA_AUDITORIA: "bajo",
    EN_AUDITORIA: "medio",
    APROBADO: "bajo",
    OBSERVADO: "alto",
    DENEGADO: "alto",
    REVISION_HUMANA: "alto"
  };

  return statusMap[status] ?? status ?? "medio";
}

async function requestApi(path) {
  const response = await fetch(`${databaseConfig.apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`API respondio con estado ${response.status}`);
  }

  return response.json();
}

export async function fetchCases() {
  try {
    const data = await requestApi(apiEndpoints.cases);
    const rows = Array.isArray(data) ? data : data.cases ?? [];

    return {
      cases: rows.map(normalizeCase),
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      cases: auditCases,
      source: "mock",
      error
    };
  }
}

export async function fetchNewCases() {
  try {
    const data = await requestApi(apiEndpoints.newCases);
    const rows = Array.isArray(data) ? data : data.cases ?? [];

    return {
      cases: rows.map(normalizeCase),
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      cases: [],
      source: "mock",
      error
    };
  }
}

export async function fetchCaseById(id) {
  const data = await requestApi(apiEndpoints.caseById(id));
  return normalizeCase(data);
}

export async function createAuditResult(payload) {
  const response = await fetch(`${databaseConfig.apiBaseUrl}${apiEndpoints.auditResults}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API respondio con estado ${response.status}`);
  }

  return response.json();
}

export async function fetchAuditResults(caseId) {
  return requestApi(apiEndpoints.auditResultsByCaseId(caseId));
}
