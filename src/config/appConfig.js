export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  useMocks: String(import.meta.env.VITE_USE_MOCKS ?? "true").toLowerCase() === "true",
  allowMockFallback: String(import.meta.env.VITE_ALLOW_MOCK_FALLBACK ?? "true").toLowerCase() === "true"
};
