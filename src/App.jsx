import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Filter,
  Gauge,
  Search,
  ShieldCheck
} from "lucide-react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { N8nAgentPanel } from "./components/N8nAgentPanel";
import { auditCases } from "./data/auditCases";

const statusCopy = {
  alto: "Riesgo alto",
  medio: "Revision",
  bajo: "Listo"
};

const statusIcon = {
  alto: AlertTriangle,
  medio: FileSearch,
  bajo: CheckCircle2
};

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function App() {
  const selectedCase = auditCases[0];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <strong>Auditor IA</strong>
            <span>Siniestros</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Vistas de auditoria">
          <NavItem to="/" icon={Gauge} label="Panel" end />
          <NavItem to="/casos" icon={FileSearch} label="Casos" />
          <NavItem to="/reglas" icon={Filter} label="Reglas" />
          <NavItem to="/agente" icon={ShieldCheck} label="Agente" />
        </nav>
      </aside>

      <section className="workspace">
        <Routes>
          <Route path="/" element={<DashboardPage selectedCase={selectedCase} />} />
          <Route path="/casos" element={<CasesPage selectedCase={selectedCase} />} />
          <Route path="/reglas" element={<RulesPage />} />
          <Route path="/agente" element={<AgentPage selectedCase={selectedCase} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>
    </main>
  );
}

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function PageHeader({ eyebrow, title }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <label className="search-box">
        <Search size={17} />
        <input placeholder="Buscar siniestro, taller o placa" />
      </label>
    </header>
  );
}

function DashboardPage({ selectedCase }) {
  return (
    <>
      <PageHeader eyebrow="Reto 2" title="Auditor agentico de facturacion de siniestros" />
      <Metrics />

      <section className="content-grid">
        <CaseInbox selectedCase={selectedCase} />

        <div className="right-stack">
          <CaseDetail selectedCase={selectedCase} />
          <N8nAgentPanel auditCase={selectedCase} />
        </div>
      </section>
    </>
  );
}

function CasesPage({ selectedCase }) {
  return (
    <>
      <PageHeader eyebrow="Casos" title="Bandeja completa de siniestros por auditar" />
      <section className="route-panel">
        <div className="section-heading">
          <h2>Casos recibidos</h2>
          <button className="icon-button" aria-label="Filtrar casos">
            <Filter size={18} />
          </button>
        </div>
        <div className="cases-table">
          {auditCases.map((auditCase) => (
            <CaseRow key={auditCase.id} auditCase={auditCase} active={auditCase.id === selectedCase.id} />
          ))}
        </div>
      </section>
    </>
  );
}

function RulesPage() {
  const rules = [
    "Comparar insumos facturados contra tarifario acordado por taller.",
    "Detectar cargos duplicados por codigo, descripcion o evidencia adjunta.",
    "Validar que la reparacion corresponda a la siniestralidad reportada.",
    "Marcar documentacion incompleta antes de enviar aprobacion humana."
  ];

  return (
    <>
      <PageHeader eyebrow="Reglas" title="Criterios iniciales del auditor" />
      <section className="rules-grid">
        {rules.map((rule, index) => (
          <article className="rule-card" key={rule}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{rule}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function AgentPage({ selectedCase }) {
  return (
    <>
      <PageHeader eyebrow="Agente" title="Conexion del agente auditable con n8n" />
      <N8nAgentPanel auditCase={selectedCase} />
    </>
  );
}

function Metrics() {
  const totalAtRisk = auditCases.reduce((sum, item) => sum + Math.max(item.invoiceTotal - item.tariffTotal, 0), 0);
  const reviewedCases = auditCases.filter((item) => item.status !== "bajo").length;

  return (
    <section className="metrics" aria-label="Resumen de auditoria">
      <Metric label="Casos recibidos" value={auditCases.length.toString()} />
      <Metric label="Por revisar" value={reviewedCases.toString()} />
      <Metric label="Monto observado" value={currency.format(totalAtRisk)} />
      <Metric label="Confianza promedio" value="93%" />
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CaseInbox({ selectedCase }) {
  return (
    <div className="case-list" aria-label="Bandeja de siniestros">
      <div className="section-heading">
        <h2>Bandeja de auditoria</h2>
        <button className="icon-button" aria-label="Filtrar casos">
          <Filter size={18} />
        </button>
      </div>
      {auditCases.map((auditCase) => (
        <CaseRow key={auditCase.id} auditCase={auditCase} active={auditCase.id === selectedCase.id} />
      ))}
    </div>
  );
}

function CaseDetail({ selectedCase }) {
  return (
    <article className="case-detail" aria-label="Detalle del siniestro seleccionado">
      <div className="detail-header">
        <div>
          <span className={`status-pill ${selectedCase.status}`}>{statusCopy[selectedCase.status]}</span>
          <h2>{selectedCase.claimNumber}</h2>
          <p>{selectedCase.vehicle}</p>
        </div>
        <div className="confidence">
          <strong>{selectedCase.confidence}%</strong>
          <span>confianza</span>
        </div>
      </div>

      <div className="summary-band">
        <div>
          <span>Taller</span>
          <strong>{selectedCase.workshop}</strong>
        </div>
        <div>
          <span>Factura</span>
          <strong>{currency.format(selectedCase.invoiceTotal)}</strong>
        </div>
        <div>
          <span>Tarifario</span>
          <strong>{currency.format(selectedCase.tariffTotal)}</strong>
        </div>
      </div>

      <p className="damage">{selectedCase.reportedDamage}</p>

      <div className="findings">
        <h3>Hallazgos del agente</h3>
        {selectedCase.findings.map((finding) => (
          <div className="finding" key={finding.id}>
            <div>
              <strong>{finding.title}</strong>
              <p>{finding.detail}</p>
            </div>
            <span>{currency.format(finding.impact)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function CaseRow({ auditCase, active }) {
  const Icon = statusIcon[auditCase.status];
  const difference = auditCase.invoiceTotal - auditCase.tariffTotal;

  return (
    <NavLink to="/casos" className={`case-row ${active ? "active" : ""}`}>
      <div className={`case-icon ${auditCase.status}`}>
        <Icon size={18} />
      </div>
      <div className="case-copy">
        <strong>{auditCase.claimNumber}</strong>
        <span>{auditCase.workshop}</span>
      </div>
      <div className="case-amount">
        <strong>{currency.format(auditCase.invoiceTotal)}</strong>
        <span>{difference > 0 ? `+${currency.format(difference)}` : "Sin desvio"}</span>
      </div>
    </NavLink>
  );
}

export default App;
