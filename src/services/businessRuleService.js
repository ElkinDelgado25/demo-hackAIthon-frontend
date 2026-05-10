import { apiEndpoints } from "../config/database";
import { apiRequest } from "./apiClient";

export async function getBusinessRules() {
  const data = await apiRequest(apiEndpoints.businessRules);
  return Array.isArray(data) ? data : data?.rules ?? data?.items ?? [];
}

export async function createBusinessRule(payload) {
  return apiRequest(apiEndpoints.businessRules, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateBusinessRule(id, payload) {
  return apiRequest(apiEndpoints.businessRuleById(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function toggleBusinessRule(id) {
  return apiRequest(apiEndpoints.businessRuleToggle(id), {
    method: "PATCH"
  });
}

export async function deleteBusinessRule(id) {
  return apiRequest(apiEndpoints.businessRuleById(id), {
    method: "DELETE"
  });
}
