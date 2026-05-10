import { appConfig } from "../config/appConfig";
import { apiRequest } from "./apiClient";
import * as localRules from "./businessRulesService";

const endpoints = {
  list: "/business-rules",
  create: "/business-rules",
  update: (id) => `/business-rules/${id}`,
  toggle: (id) => `/business-rules/${id}/toggle`,
  remove: (id) => `/business-rules/${id}`
};

export const businessRulesEndpoints = localRules.businessRulesEndpoints;

export async function getBusinessRules() {
  if (appConfig.useMocks) {
    return localRules.getBusinessRules();
  }

  try {
    const data = await apiRequest(endpoints.list);
    return Array.isArray(data) ? data : data.rules ?? [];
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    return localRules.getBusinessRules();
  }
}

export async function createBusinessRule(payload) {
  if (appConfig.useMocks) {
    return localRules.createBusinessRule(payload);
  }

  try {
    return apiRequest(endpoints.create, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    return localRules.createBusinessRule(payload);
  }
}

export async function updateBusinessRule(id, payload) {
  if (appConfig.useMocks) {
    return localRules.updateBusinessRule(id, payload);
  }

  try {
    return apiRequest(endpoints.update(id), {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    return localRules.updateBusinessRule(id, payload);
  }
}

export async function toggleBusinessRule(id) {
  if (appConfig.useMocks) {
    return localRules.toggleBusinessRule(id);
  }

  try {
    return apiRequest(endpoints.toggle(id), {
      method: "PATCH"
    });
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    return localRules.toggleBusinessRule(id);
  }
}

export async function deleteBusinessRule(id) {
  if (appConfig.useMocks) {
    return localRules.deleteBusinessRule(id);
  }

  try {
    return apiRequest(endpoints.remove(id), {
      method: "DELETE"
    });
  } catch (error) {
    if (!appConfig.allowMockFallback) {
      throw error;
    }

    return localRules.deleteBusinessRule(id);
  }
}
