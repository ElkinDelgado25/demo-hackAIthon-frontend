import { AlertTriangle, CheckCircle2, FileSearch, Filter, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BusinessRulesDashboard } from "../components/BusinessRulesDashboard";
import { FileUploadSection } from "../components/FileUploadSection";
import { N8nAgentPanel } from "../components/N8nAgentPanel";
import { auditCases } from "../data/auditCases";
import { fetchCases } from "../services/caseService";

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

const POLLING_INTERVAL_MS = 5 * 60 * 1000;

export function DashboardPage() {
  const [cases, setCases] = useState(auditCases);
  const [selectedCase, setSelectedCase] = useState(auditCases[0]);

  useEffect(() => {
    setSelectedCase((currentCase) => cases.find((auditCase) => auditCase.id === currentCase?.id) ?? cases[0]);
  }, [cases]);

  return (
    <>
      <PageHeader eyebrow="Reto 2" title="Auditor agentico de facturacion de siniestros" />
      <Metrics cases={cases} />

      <section className="content-grid">
        <CaseInbox cases={cases} selectedCase={selectedCase} onSelectCase={setSelectedCase} />

        <div className="right-stack">
          <CaseDetail selectedCase={selectedCase} />
          <N8nAgentPanel auditCase={selectedCase} />
        </div>
      </section>
    </>
  );
}

export function CasesPage() {
  const [cases, setCases] = useState(auditCases);
  const [selectedCase, setSelectedCase] = useState(auditCases[0]);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [newCasesCount, setNewCasesCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const casesRef = useRef(auditCases);

  useEffect(() => {
    let isMounted = true;

    async function loadCases({ silent = false } = {}) {
      const previousCaseIds = new Set(casesRef.current.map((auditCase) => auditCase.id));
      const result = await fetchCases();

      if (!isMounted) {
        return;
      }

      const incomingCases = result.cases;
      const detectedNewCases = incomingCases.filter((auditCase) => !previousCaseIds.has(auditCase.id)).length;

      casesRef.current = incomingCases;
      setCases(incomingCases);
      setSelectedCase((currentCase) => incomingCases.find((auditCase) => auditCase.id === currentCase?.id) ?? incomingCases[0]);
      setIsUsingMock(result.source === "mock");
      setLastUpdated(new Date());

      if (silent && detectedNewCases > 0) {
        setNewCasesCount(detectedNewCases);
      }
    }

    loadCases();
    const intervalId = window.setInterval(() => loadCases({ silent: true }), POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <PageHeader eyebrow="Casos" title="Bandeja completa de siniestros por auditar" />
      <section className="route-panel">
        <div className="section-heading">
          <div>
            <h2>Casos recibidos</h2>
            {lastUpdated ? <p className="section-note">Actualizado: {lastUpdated.toLocaleTimeString("es-EC")}</p> : null}
          </div>
          <button className="icon-button" aria-label="Filtrar casos">
            <Filter size={18} />
          </button>
        </div>
        {isUsingMock ? <div className="form-message info">Usando datos de demostracion</div> : null}
        {newCasesCount > 0 ? (
          <div className="form-message success">{newCasesCount} caso(s) nuevo(s) detectado(s) en la ultima actualizacion.</div>
        ) : null}
        <div className="cases-table">
          {cases.map((auditCase) => (
            <CaseRow
              key={auditCase.id}
              auditCase={auditCase}
              active={auditCase.id === selectedCase?.id}
              onSelectCase={setSelectedCase}
            />
          ))}
        </div>
      </section>
      {selectedCase ? <CaseDetail selectedCase={selectedCase} compact /> : null}
      {selectedCase ? <FileUploadSection defaultAuditNumber={selectedCase.claimNumber} /> : null}
    </>
  );
}

export function UploadsPage() {
  const selectedCase = auditCases[0];

  return (
    <>
      <PageHeader eyebrow="Archivos" title="Gestion de documentos para auditoria" />
      <FileUploadSection defaultAuditNumber={selectedCase.claimNumber} />
    </>
  );
}

export function RulesPage() {
  return (
    <>
      <PageHeader eyebrow="Reglas" title="Dashboard de reglas de negocio" />
      <BusinessRulesDashboard />
    </>
  );
}

export function AgentPage() {
  const selectedCase = auditCases[0];

  return (
    <>
      <PageHeader eyebrow="Agente" title="Conexion del agente auditable con n8n" />
      <N8nAgentPanel auditCase={selectedCase} />
    </>
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

function Metrics({ cases }) {
  const totalAtRisk = cases.reduce((sum, item) => sum + Math.max(item.invoiceTotal - item.tariffTotal, 0), 0);
  const reviewedCases = cases.filter((item) => item.status !== "bajo").length;

  return (
    <section className="metrics" aria-label="Resumen de auditoria">
      <Metric label="Casos recibidos" value={cases.length.toString()} />
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

function CaseInbox({ cases, selectedCase, onSelectCase }) {
  return (
    <div className="case-list" aria-label="Bandeja de siniestros">
      <div className="section-heading">
        <h2>Bandeja de auditoria</h2>
        <button className="icon-button" aria-label="Filtrar casos">
          <Filter size={18} />
        </button>
      </div>
      {cases.map((auditCase) => (
        <CaseRow
          key={auditCase.id}
          auditCase={auditCase}
          active={auditCase.id === selectedCase.id}
          onSelectCase={onSelectCase}
        />
      ))}
    </div>
  );
}

function CaseDetail({ selectedCase, compact }) {
  return (
    <article className={`case-detail ${compact ? "compact" : ""}`} aria-label="Detalle del siniestro seleccionado">
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

function CaseRow({ auditCase, active, onSelectCase }) {
  const Icon = statusIcon[auditCase.status];
  const difference = auditCase.invoiceTotal - auditCase.tariffTotal;

  return (
    <button type="button" className={`case-row ${active ? "active" : ""}`} onClick={() => onSelectCase?.(auditCase)}>
      <div className={`case-icon ${auditCase.status}`}>
        <Icon size={18} />
      </div>
      <div className="case-copy">
        <strong>{auditCase.claimNumber}</strong>
        <span>{auditCase.workshop}</span>
      </div>
      <div className="case-amount">
        <strong>{currency.format(auditCase.invoiceTotal)}</strong>
        <span>{auditCase.rawStatus ?? (difference > 0 ? `+${currency.format(difference)}` : "Sin desvio")}</span>
      </div>
    </button>
  );
}
