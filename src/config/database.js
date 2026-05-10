import { appConfig } from "./appConfig";

export const databaseConfig = {
  provider: import.meta.env.VITE_DB_PROVIDER ?? "api",
  apiBaseUrl: appConfig.apiBaseUrl
};

export const apiEndpoints = {
  cases: "/cases",
  caseById: (id) => `/cases/${id}`,
  caseDocuments: (caseId) => `/cases/${caseId}/documents`,
  auditRun: (caseId) => `/audit/${caseId}`,
  auditLatest: (caseId) => `/audit/${caseId}/latest`,
  auditHistory: (caseId) => `/audit/${caseId}/history`,
  businessRules: "/business-rules",
  businessRuleById: (ruleId) => `/business-rules/${ruleId}`,
  businessRuleToggle: (ruleId) => `/business-rules/${ruleId}/toggle`,
  dashboardStatistics: "/statistics/dashboard",
  denialReasons: "/statistics/denial-reasons"
};
