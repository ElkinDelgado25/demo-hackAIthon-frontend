import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { Navbar } from "./components/Navbar";
import { AgentPage, CasesPage, DashboardPage, RulesPage, UploadsPage } from "./pages/AuditPages";
import { Homepage } from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="landing-shell">
            <Navbar />
            <Homepage />
          </main>
        }
      />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="files" element={<UploadsPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="agent" element={<AgentPage />} />
      </Route>

      <Route path="/casos" element={<Navigate to="/dashboard/cases" replace />} />
      <Route path="/archivos" element={<Navigate to="/dashboard/files" replace />} />
      <Route path="/reglas" element={<Navigate to="/dashboard/rules" replace />} />
      <Route path="/agente" element={<Navigate to="/dashboard/agent" replace />} />
      <Route path="/cases" element={<Navigate to="/dashboard/cases" replace />} />
      <Route path="/files" element={<Navigate to="/dashboard/files" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
