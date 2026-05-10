import { apiEndpoints } from "../config/database";
import { apiRequest } from "./apiClient";

export async function fetchCases() {
  const data = await apiRequest(apiEndpoints.cases);
  const rows = Array.isArray(data) ? data : data?.cases ?? data?.items ?? [];
  return rows.map(normalizeCase);
}

export async function fetchCaseById(id) {
  const data = await apiRequest(apiEndpoints.caseById(id));
  return data ? normalizeCase(data) : null;
}

function normalizeCase(apiCase) {
  const vehicle = apiCase.vehicle ?? {};
  const vehicleModel = vehicle.model ?? apiCase.vehicleModel ?? apiCase.vehiculo ?? apiCase.vehicle ?? "";
  const plate = vehicle.plate ?? apiCase.plate ?? apiCase.placa ?? "";
  const reportedDamages = apiCase.reportedDamages ?? apiCase.danos_reportados ?? apiCase.damages ?? [];

  return {
    id: apiCase.id ?? apiCase.caseId ?? apiCase.codigo ?? apiCase.code ?? "",
    claimNumber: apiCase.claimNumber ?? apiCase.codigo ?? apiCase.code ?? apiCase.caseId ?? apiCase.id ?? "",
    workshop: apiCase.workshop ?? apiCase.taller ?? apiCase.workshopName ?? "",
    vehicle: vehicleModel,
    plate,
    reportedDamage: Array.isArray(reportedDamages) ? reportedDamages.join(", ") : reportedDamages,
    reportedDamages: Array.isArray(reportedDamages) ? reportedDamages : [reportedDamages].filter(Boolean),
    invoiceTotal: toNumberOrNull(apiCase.invoiceTotal ?? apiCase.monto_facturado ?? apiCase.amount),
    tariffTotal: toNumberOrNull(apiCase.tariffTotal ?? apiCase.monto_estimado ?? apiCase.estimatedAmount),
    status: normalizeCaseStatus(apiCase.status ?? apiCase.estado),
    rawStatus: apiCase.status ?? apiCase.estado ?? "",
    confidence: toNumberOrNull(apiCase.confidence ?? apiCase.confianza),
    receivedAt: apiCase.receivedAt ?? apiCase.created_at ?? apiCase.createdAt ?? "",
    findings: apiCase.findings ?? apiCase.hallazgos ?? []
  };
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return Number(value);
}

function normalizeCaseStatus(status) {
  const statusMap = {
    APROBADO: "bajo",
    OBSERVADO: "alto",
    DENEGADO: "alto",
    REVISION_HUMANA: "medio",
    EN_AUDITORIA: "medio",
    LISTO_PARA_AUDITORIA: "bajo",
    PENDIENTE_DOCUMENTOS: "medio",
    NUEVO: "medio"
  };

  return statusMap[status] ?? "medio";
}
