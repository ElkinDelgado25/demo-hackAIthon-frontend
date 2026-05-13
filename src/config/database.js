import { appConfig } from "./appConfig";

export const databaseConfig = {
  provider: import.meta.env.VITE_DB_PROVIDER ?? "api",
  apiBaseUrl: appConfig.apiBaseUrl
};

export const apiEndpoints = {
  cases: "/cases",
  caseById: (id) => `/cases/${id}`,
  allDocuments: "/cases/documents",
  caseDocuments: (caseId) => `/cases/${caseId}/documents`,
  auditRun: (caseId) => `/audit/${caseId}`,
  auditLatest: (caseId) => `/audit/${caseId}/latest`,
  auditHistoryAll: "/audit/history",
  auditHistory: (caseId) => `/audit/${caseId}/history`,
  auditFinalVerdict: (caseId) => `/audit/${caseId}/final-verdict`,
  auditBatch: "/audit/batch",
  businessRules: "/business-rules",
  businessRuleById: (ruleId) => `/business-rules/${ruleId}`,
  businessRuleToggle: (ruleId) => `/business-rules/${ruleId}/toggle`,
  dashboardStatistics: "/statistics/dashboard",
  denialReasons: "/statistics/denial-reasons"
};
