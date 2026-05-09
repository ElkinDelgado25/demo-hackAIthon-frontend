export function RuleStatsCards({ rules }) {
  const total = rules.length;
  const active = rules.filter((rule) => rule.status === "ACTIVA").length;
  const inactive = rules.filter((rule) => rule.status === "INACTIVA").length;
  const critical = rules.filter((rule) => rule.severity === "CRITICA").length;

  return (
    <section className="metrics" aria-label="Resumen de reglas">
      <StatCard label="Total reglas" value={total} />
      <StatCard label="Activas" value={active} />
      <StatCard label="Inactivas" value={inactive} />
      <StatCard label="Criticas" value={critical} />
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
