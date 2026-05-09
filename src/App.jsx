import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AgentPage, CasesPage, RulesPage, UploadsPage } from "./pages/AuditPages";
import { Homepage } from "./pages/HomePage";

function App() {
  return (
    <main className="app-shell">
      <Navbar />

      <section className="workspace">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/casos" element={<CasesPage />} />
          <Route path="/archivos" element={<UploadsPage />} />
          <Route path="/reglas" element={<RulesPage />} />
          <Route path="/agente" element={<AgentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>
    </main>
  );
}

export default App;
