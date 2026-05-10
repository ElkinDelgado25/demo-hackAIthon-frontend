import { StatCard } from "./States";

export function RuleStatsCards({ rules }) {
  if (rules.length === 0) {
    return (
      <section className="metrics" aria-label="Resumen de reglas">
        <StatCard label="Total reglas" value={null} />
        <StatCard label="Activas" value={null} />
        <StatCard label="Inactivas" value={null} />
        <StatCard label="Criticas" value={null} />
      </section>
    );
  }

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
