export const databaseConfig = {
  provider: import.meta.env.VITE_DB_PROVIDER ?? "api",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  n8nAuditWebhookUrl:
    import.meta.env.VITE_N8N_AUDIT_WEBHOOK_URL ?? import.meta.env.VITE_N8N_AUDITOR_WEBHOOK_URL ?? ""
};

export const apiEndpoints = {
  cases: "/cases",
  caseById: (id) => `/cases/${id}`,
  newCases: "/cases/new",
  auditResults: "/audit-results",
  auditResultsByCaseId: (caseId) => `/audit-results/${caseId}`
};
