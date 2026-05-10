import { apiEndpoints } from "../config/database";
import { apiRequest } from "./apiClient";

export async function fetchDashboardStatistics() {
  return apiRequest(apiEndpoints.dashboardStatistics);
}

export async function fetchDenialReasons() {
  const data = await apiRequest(apiEndpoints.denialReasons);
  return Array.isArray(data) ? data : data?.reasons ?? [];
}
